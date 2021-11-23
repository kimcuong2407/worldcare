import { InternalServerError } from '@app/core/types/ErrorTypes';
import { AnyLengthString } from 'aws-sdk/clients/comprehend';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { PURCHASE_ORDER_STATUS } from './constant';
import PurchaseOrderCollection from './purchase-order.collection';


const initIdSequence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const purchaseOrderAutoIncrease = async (record: any) => {
  return await new Promise((resolve, reject) => {
    record.setNext('purchase_order_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err)
      }
      const purchaseOrderCode = `DH${initIdSequence(record.codeSequence)}`
      const doc = await PurchaseOrderCollection
        .findOne({code: purchaseOrderCode, branchId: get(record, '_doc').branchId})
        .lean().exec();
      if (!isNil(doc)) {
        await purchaseOrderAutoIncrease(record);
      }
      record.code = purchaseOrderCode;
      await record.save();
      resolve();
    });
  }).catch(() => {
    throw new InternalServerError('Failed to increase purchase order ID.');
  })
}

const persistsPurchaseOrder = async (info: any) => {
  const code = get(info, 'code', null);
  const purchaseOrder = await PurchaseOrderCollection.create(info);
  if (isNil(code)) {
    await purchaseOrderAutoIncrease(purchaseOrder);
  }

  return {
    ...get(purchaseOrder, '_doc', {})
  }
}

const createPurchaseOrder = async (info: any) => {
  return await persistsPurchaseOrder(info);
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
  purchaseOrderAutoIncrease
};
