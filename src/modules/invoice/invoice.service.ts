import {InternalServerError, ValidationFailedError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { identity, map } from 'lodash';
import InvoiceCollection from './invoice.collection';
import loggerHelper from '@utils/logger.util';
import paymentNoteService from '@app/modules/payment-note/paymentNote.service';
import {INVOICE_STATUS} from '@modules/invoice/constant';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import documentCodeUtils from '@utils/documentCode.util';
import customerV2Service from '../customer-v2/customerV2.service';
import productService from '../product/product.service';
import batchService from '../batch/batch.service';
import saleService from '../sale/sale.service';


const logger = loggerHelper.getLogger('invoice.service');

const invoiceAutoIncrease = async (record: any, code: string | undefined = undefined) => {
  if (code) {
    record.code = documentCodeUtils.generateDocumentSubCode(code);
    await record.save();
    return;
  }

  await new Promise((resolve, reject) => {
    record.setNext('invoice_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err)
      }
      const invoiceCode = documentCodeUtils.initDocumentCode('HD', record.codeSequence);
      const doc = await InvoiceCollection
        .findOne({code: invoiceCode, branchId: get(record, '_doc').branchId})
        .lean().exec();
      if (!isNil(doc)) {
        await invoiceAutoIncrease(record);
      }
      record.code = invoiceCode;
      await record.save();
      resolve();
    });
  }).catch(() => {
    return new InternalServerError('Failed to increase ID.');
  })
}

const persistsInvoice = async (info: any) => {
  const code = get(info, 'code', null);
  const invoice = await InvoiceCollection.create(info);
  if (isNil(code)) {
    await invoiceAutoIncrease(invoice);
  }
  await saleService.createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT, info, invoice['_id']);
  return {
    ...get(invoice, '_doc', {})
  }
}

const createInvoice = async (info: any) => {
  return await persistsInvoice(info);
};

const fetchInvoiceListByQuery = async (queryInput: any, options: any) => {
  const query = {
    deletedAt: null,
    branchId: queryInput.branchId
  } as any
  if (queryInput.keyword) {
    query.code = {
      $regex: '.*' + queryInput.keyword + '.*', $options: 'i'
    }
  }
  if(queryInput.toDate) {
    query.createdAt = {
      $gte: new Date(queryInput.fromDate),
      $lte: new Date(queryInput.toDate)
    };
  } else if (queryInput.fromDate) {
    query.createdAt = {
      $gte: new Date(queryInput.fromDate)
    };
  }
  if(queryInput.batchInfo) {
    const batches = await batchService.searchBatches(queryInput.batchInfo, queryInput.branchId);
    query.invoiceDetail = {$elemMatch : {productId: {$in: map(batches, 'productId')}}};
  }
  if(queryInput.customerInfo) {
    const customers = await customerV2Service.searchCustomer(queryInput.customerInfo, queryInput.partnerId);
    query.customerId =  {$in: map(customers, '_id')};
  };
  if(queryInput.productCode || queryInput.productName) {
    const keyword = queryInput.productCode ? queryInput.productCode : queryInput.productName;
    const products = await productService.searchProductVariants(keyword, queryInput.branchId);
    query.invoiceDetail = {$elemMatch : {productId: {$in: map(products, 'productId')}}};
  };
  if (!isNil(queryInput.status) && queryInput.status.trim().length !== 0) {
    const statuses = queryInput.status.split(',');
    query.status = {
      $in: statuses
    }
  } 
  const invoices = await InvoiceCollection.paginate(query, {
    ...options,
    sort: { createdAt: -1 },
    lean: true,
    populate: [
      { path: 'customer' },
      { path: 'branch' },
      {
        path: 'paymentNotes',
        strictPopulate: false,
        populate: {path: 'createdBy', select: '-password'}
      },
      { path: 'createdBy', select: '-password' },
      { path: 'saleOrder' },
      { path: 'prescription' }
    ]
  })
  const summary = await summaryInvoice(query);
  const {docs, ...rest} = invoices
  return {
    docs,
    ...rest,
    summary
  }
};

const summaryInvoice = async (query: any) => {
  const summary = await InvoiceCollection.aggregate([
    {
      $match: {
        ...query,
        branchId: parseInt(query.branchId)
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        discountValue: 1,
        totalPayment: 1
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: '$total'
        },
        discountValue: {
          $sum: '$discountValue'
        },
        totalPayment: {
          $sum: '$totalPayment'
        }
      }
    }
  ])
  if (summary.length > 0) {
    return {
      total: summary[0].total,
      discountValue: summary[0].discountValue,
      totalPayment: summary[0].totalPayment
    }
  }
  return {
    total: 0,
    discountValue: 0,
    totalPayment: 0
  }
}

const fetchInvoiceInfoByQuery = async (query: any) => {
  return await InvoiceCollection.findOne(query)
    .populate('customer')
    .populate('branch')
    .populate({
      path: 'paymentNotes',
      strictPopulate: false,
      populate: {path: 'createdBy', select: '-password'}
    })
    .populate({
      path: 'createdBy',
      select: '-password'
    })
    .populate('saleOrder')
    .populate('prescription')
    .lean().exec();
};

const updateInvoice = async (query: any, info: any) => {
  return await InvoiceCollection.updateOne(
    query,
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

function validateCancelInvoice(invoice: any) {
  if (isNil(invoice)) {
    throw new ValidationFailedError('Invoice is not found.');
  }
  if (invoice.status === INVOICE_STATUS.CANCELED) {
    throw new ValidationFailedError('Invoice is already canceled.');
  }
}

/**
 * cancel an invoice
 * 1. set status is CANCELED
 * 2. cancel inventory transactions
 * 3. Void payment
 * @param id
 * @param branchId
 * @param voidPayment
 */
const cancelInvoice = async (id: string, branchId: number, voidPayment: boolean) => {
  logger.info(`Canceling Invoice. Id=${id} branchId=${branchId} voidPayment=${voidPayment}`)
  const query: any = {
    _id: id,
    branchId,
    deletedAt: null
  }
  const invoice = await InvoiceCollection.findOne(query).lean().exec();

  validateCancelInvoice(invoice);

  // Update status
  await InvoiceCollection.updateOne(query, {
      $set: {status: INVOICE_STATUS.CANCELED}
    },{new: true});

  // Cancel Inventory transaction
  const inventoryTransactions = await inventoryTransactionService.fetchInventoryTransactionsByQuery({
    type: INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT,
    referenceDocId: id
  })
  await inventoryTransactionService.cancelInventoryTransactions(inventoryTransactions);

  // void payment
  if (voidPayment) {
    const paymentNoteIds = invoice.paymentNoteIds || [];
    for (const paymentNoteId of paymentNoteIds) {
      await paymentNoteService.cancelPaymentNote({_id: paymentNoteId})
    }
  }
  logger.info(`Invoice id=${id} is canceled`);
  return true;
};

export default {
  createInvoice,
  fetchInvoiceListByQuery,
  fetchInvoiceInfoByQuery,
  updateInvoice,
  cancelInvoice,
  invoiceAutoIncrease
};