import { AnyLengthString } from "aws-sdk/clients/comprehend";
import { PURCHASE_ORDER_STATUS } from "./constant";
import PurchaseOrderCollection from "./purchase-order.collection";

const createPurchaseOrder = async (info: any) => {
  const created  = await PurchaseOrderCollection.create(info);
  const record = await PurchaseOrderCollection.findOne({
    _id: created._id,
  });
  return record;
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
