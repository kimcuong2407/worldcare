import { InternalServerError } from '@app/core/types/ErrorTypes';
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

const fetchInvoiceListByQuery = async (query: any) => {
  const list = await InvoiceCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
};

const fetchInvoiceInfoByQuery = async (query: any) => {
  const record = await InvoiceCollection.findOne(query).lean().exec();
  return record;
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