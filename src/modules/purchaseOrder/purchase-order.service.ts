import { InternalServerError } from "@app/core/types/ErrorTypes";
import { AnyLengthString } from "aws-sdk/clients/comprehend";
import get from "lodash/get";
import isNil from "lodash/isNil";
import { PURCHASE_ORDER_STATUS } from "./constant";
import PurchaseOrderCollection from "./purchase-order.collection";


const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const invoiceAutoIncrease = (record: any) => {
  record.setNext('purchase_order_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `HD${initIdSquence(record.idSequence)}`
    const doc = await PurchaseOrderCollection.findOne({increasedId}).lean().exec();
    if(!isNil(doc)) invoiceAutoIncrease(record);
    record.variantId = increasedId;
    record.save();
  });
}

const persistsInvoice = async (info: any) => {
  const code = get(info, 'code', null);
  const invoice = await PurchaseOrderCollection.create(info);
  if (isNil(code)) {
    invoiceAutoIncrease(invoice);
  }

  return {
    ...get(invoice, '_doc', {})
  }
}

const createPurchaseOrder = async (info: any) => {
  info.status = PURCHASE_ORDER_STATUS.ACTIVE;
  return await persistsInvoice(info);
};

const fetchPurchaseOrderListByQuery = async (query: any) => {
  const list = await PurchaseOrderCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
};

const fetchPurchaseOrderInfoByQuery = async (query: any) => {
  const record = await PurchaseOrderCollection.findOne(query).lean().exec();
  return record;
};

const updatePurchaseOrder = async (query: any, info: any) => {
  return await PurchaseOrderCollection.updateOne(
    query,
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

const deletePurchaseOrder = async (query: any) => {
  return await PurchaseOrderCollection.updateOne(
    query,
    {
      $set: {
        status: PURCHASE_ORDER_STATUS.INACTIVE,
        deletedAt: new Date()
      },
    },
    { new: true }
  );
};

export default {
  createPurchaseOrder,
  fetchPurchaseOrderListByQuery,
  fetchPurchaseOrderInfoByQuery,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
