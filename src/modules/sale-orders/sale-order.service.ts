import {InternalServerError, ValidationFailedError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import SaleOrderCollection from './sale-order.collection';
import {Types} from 'mongoose';
import {SALE_ORDER_STATUS} from '@modules/sale-orders/constant';
import batchService from '@modules/batch/batch.service';
import paymentNoteService from '@app/modules/payment-note/paymentNote.service';
import loggerHelper from '@utils/logger.util';
import {INVOICE_STATUS} from '@modules/invoice/constant';

const logger = loggerHelper.getLogger('sale-order.service');

const initIdSequence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const saleOrderAutoIncrease = async (record: any) => {
  return await new Promise((resolve, reject) => {
    record.setNext('sale_order_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err)
      }
      const saleOrderCode = `DH${initIdSequence(record.codeSequence)}`
      const doc = await SaleOrderCollection
        .findOne({code: saleOrderCode, branchId: get(record, '_doc').branchId})
        .lean().exec();
      if (!isNil(doc)) {
        await saleOrderAutoIncrease(record);
      }
      record.code = saleOrderCode;
      await record.save();
      resolve();
    });
  }).catch(() => {
    throw new InternalServerError('Failed to increase purchase order ID.');
  })
}

const persistsSaleOrder = async (info: any) => {
  const code = get(info, 'code', null);
  const saleOrder = await SaleOrderCollection.create(info);
  if (isNil(code)) {
    await saleOrderAutoIncrease(saleOrder);
  }

  return {
    ...get(saleOrder, '_doc', {})
  }
}

const createSaleOrder = async (info: any) => {
  return await persistsSaleOrder(info);
};

const fetchSaleOrderListByQuery = async (queryInput: any, options: any) => {
  const query: any = {
    deletedAt: null,
    branchId: queryInput.branchId
  }
  if (queryInput.keyword) {
    query.code = {
      $regex: '.*' + queryInput.keyword + '.*', $options: 'i'
    }
  }
  if (!isNil(queryInput.status) && queryInput.status.trim().length !== 0) {
    const statuses = queryInput.status.split(',');
    query.status = {
      $in: statuses
    }
  }
  const saleOrders = await SaleOrderCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    lean: true,
    populate: [
      {path: 'branch'},
      {path: 'invoices'},
      {
        path: 'paymentNotes',
        strictPopulate: false,
        populate: {path: 'createdBy', select: '-password'}
      },
      {path: 'saleOrderDetail.product'},
      {path: 'saleOrderDetail.batch'},
      {path: 'customer'},
      {path: 'createdBy', select: '-password'},
      {
        path: 'saleOrderDetail.productVariant',
        strictPopulate: false,
        populate: 'unit'
      }
    ],
  });
  const {docs, ...rest} = saleOrders;
  const summary = await summarySaleOrders(query);
  return {
    docs,
    ...rest,
    summary
  };
};

const summarySaleOrders = async (query: any) => {
  const summary = await SaleOrderCollection.aggregate([
    {
      $match: {
        ...query,
        branchId: parseInt(query.branchId)
      }
    },
    {
      $project: {
        _id: 0,
        customerNeedToPay: 1,
        customerPaid: 1
      }
    },
    {
      $group: {
        _id: null,
        customerNeedToPay: {
          $sum: '$customerNeedToPay'
        },
        customerPaid: {
          $sum: '$customerPaid'
        }
      }
    }
  ])
  if (summary.length > 0) {
    return {
      customerNeedToPay: summary[0].customerNeedToPay,
      customerPaid: summary[0].customerPaid
    }
  }
  return {
    customerNeedToPay: 0,
    customerPaid: 0
  }
}

const fetchSaleOrderInfoByQuery = async (query: any) => {
  const saleOrder = await SaleOrderCollection.findOne(query)
    .populate('branch')
    .populate({
      path: 'invoices',
      strictPopulate: false,
      populate: [
        {path: 'customer'},
        {path: 'branch'},
        {path: 'createdBy', select: '-password'},
      ]
    })
    .populate({
      path: 'paymentNotes',
      strictPopulate: false,
      populate: {path: 'createdBy', select: '-password'}
    })
    .populate('saleOrderDetail.product')
    .populate('saleOrderDetail.batch')
    .populate('customer')
    .populate({path: 'createdBy',select: '-password'})
    .populate({
        path: 'saleOrderDetail.productVariant',
        strictPopulate: false,
        populate: 'unit'
      })
    .lean().exec();
  if (saleOrder) {
    await batchService.setItemsFullBatches(saleOrder.saleOrderDetail);
  }
  return saleOrder;
};

const updateSaleOrder = async (query: any, info: any) => {
  return await SaleOrderCollection.updateOne(
    query,
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

const deleteSaleOrder = async (id: string, branchId: number, voidPayment: boolean) => {
  logger.info(`Canceling Sale order. Id=${id} branchId=${branchId} voidPayment=${voidPayment}`)
  const query: any = {
    _id: id,
    branchId,
    deletedAt: null
  }
  const saleOrder = await SaleOrderCollection.findOne(query).populate('invoices').lean().exec();
  if (isNil(saleOrder)) {
    throw new ValidationFailedError('Sale order is not found.');
  }
  switch (saleOrder.status) {
    case SALE_ORDER_STATUS.COMPLETED:
      if (saleOrder.invoices
        && saleOrder.invoices.some((invoice: any) => invoice.status === INVOICE_STATUS.COMPLETED)) {
        throw new ValidationFailedError('Can not delete Sale order already has Invoice.');
      }
      break;
    case SALE_ORDER_STATUS.CANCELED:
      throw new ValidationFailedError('Sale order is already canceled.');
  }

  await SaleOrderCollection.updateOne(query, {
      $set: {
        status: SALE_ORDER_STATUS.CANCELED
      }
    },
    {new: true}
  );

  if (voidPayment) {
    const paymentNoteIds = saleOrder.paymentNoteIds || [];
    for (const paymentNoteId of paymentNoteIds) {
      await paymentNoteService.cancelPaymentNote({_id: paymentNoteId})
    }
  }
  logger.info(`Sale order id=${id} is canceled`);

  return true;
};

const calculateTotalOrderQuantity = async (variantId: string, branchId: string) => {
  const aggregate = [
    {
      $match: {
        saleOrderDetail: {
          $elemMatch: {
            variantId: Types.ObjectId(variantId)
          }
        },
        branchId: parseInt(branchId),
        status: SALE_ORDER_STATUS.DRAFT
      }
    },
    {
      $project: {
        _id: 0,
        saleOrderDetail: 1
      }
    },
    {
      $unwind: {
        path: '$saleOrderDetail'
      }
    },
    {
      $match: {
        'saleOrderDetail.variantId': Types.ObjectId(variantId)
      }
    },
    {
      $group: {
        _id: 'quantity',
        quantity: {
          $sum: '$saleOrderDetail.quantity'
        }
      }
    }
  ]
  const summary = await SaleOrderCollection.aggregate(aggregate);
  if (summary && summary.length !== 0) {
    return summary[0].quantity;
  } else {
    return 0;
  }
};

export default {
  createSaleOrder,
  fetchSaleOrderListByQuery,
  fetchSaleOrderInfoByQuery,
  updateSaleOrder,
  deleteSaleOrder,
  saleOrderAutoIncrease,
  calculateTotalOrderQuantity
};
