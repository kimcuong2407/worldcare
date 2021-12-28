import {InternalServerError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import SaleOrderCollection from './sale-order.collection';

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
  const saleOrders = await SaleOrderCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    lean: true,
    populate: [
      {path: 'branch'},
      {path: 'invoice'},
      {path: 'paymentNote'},
      {path: 'saleOrderDetail.product'},
      {path: 'saleOrderDetail.batch'},
      {path: 'customer'},
      {path: 'createdBy'},
      {
        path: 'saleOrderDetail.productVariant',
        strictPopulate: false,
        populate: 'unit'
      }
    ],
  });
  const {docs, ...rest} = saleOrders;
  return {
    docs,
    ...rest
  };
};
    // .populate('customer')
    // .populate('branch')
    // .populate('paymentNotes')
    // .populate('createdBy')

const fetchSaleOrderInfoByQuery = async (query: any) => {
  return await SaleOrderCollection.findOne(query)
    .populate('branch')
    .populate({
      path: 'invoice',
      strictPopulate: false,
      populate: [
        {path: 'customer'},
        {path: 'branch'},
        {path: 'createdBy', select: '-password'},
      ]
    })
    .populate('paymentNotes')
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

const deleteSaleOrder = async (query: any) => {
  return await SaleOrderCollection.updateOne(
    query,
    {
      $set: {
        deletedAt: new Date()
      },
    },
    { new: true }
  );
};

export default {
  createSaleOrder,
  fetchSaleOrderListByQuery,
  fetchSaleOrderInfoByQuery,
  updateSaleOrder,
  deleteSaleOrder,
  saleOrderAutoIncrease
};
