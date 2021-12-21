import {InternalServerError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import InvoiceCollection from './invoice.collection';

const initIdSequence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const invoiceAutoIncrease = async (record: any) => {
  await new Promise((resolve, reject) => {
    record.setNext('invoice_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err)
      }
      const invoiceCode = `HD${initIdSequence(record.codeSequence)}`;
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
  const invoices = await InvoiceCollection.paginate(query, {
    ...options,
    sort: { createdAt: -1 },
    lean: true,
    populate: [
      { path: 'customer'},
      { path: 'branch'},
      { path: 'paymentNote'},
      { path: 'createdBy'}
    ]
  })
  const {docs, ...rest} = invoices
  return {
    docs,
    ...rest
  }
};

const fetchInvoiceInfoByQuery = async (query: any) => {
  return await InvoiceCollection.findOne(query)
    .populate('customer')
    .populate('branch')
    .populate('paymentNote')
    .populate('createdBy')
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

const deleteInvoice = async (query: any) => {
  return await InvoiceCollection.updateOne(
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
  createInvoice,
  fetchInvoiceListByQuery,
  fetchInvoiceInfoByQuery,
  updateInvoice,
  deleteInvoice,
  invoiceAutoIncrease
};