import { InternalServerError } from "@app/core/types/ErrorTypes";
import get from "lodash/get";
import isNil from "lodash/isNil";
import { INVOICE_STATUS } from "./constant";
import InvoiceCollection from "./invoice.collection";

const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const invoiceAutoIncrease = (record: any) => {
  record.setNext('variant_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `HD${initIdSquence(record.idSequence)}`
    const doc = await InvoiceCollection.findOne({increasedId}).lean().exec();
    if(!isNil(doc)) invoiceAutoIncrease(record);
    record.variantId = increasedId;
    record.save();
  });
}

const persistsInvoice = async (info: any) => {
  const code = get(info, 'code', null);
  const invoice = await InvoiceCollection.create(info);
  if (isNil(code)) {
    invoiceAutoIncrease(invoice);
  }

  return {
    ...get(invoice, '_doc', {})
  }
}

const createInvoice = async (info: any) => {
  info.status = INVOICE_STATUS.ACTIVE;
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
        status: INVOICE_STATUS.INACTIVE,
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
};