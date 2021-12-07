import { InternalServerError } from '@app/core/types/ErrorTypes';
import { AnyLengthString } from 'aws-sdk/clients/comprehend';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { SALE_ORDER_STATUS } from './constant';
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

const fetchSaleOrderListByQuery = async (query: any) => {
  const list = await SaleOrderCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
};

const fetchSaleOrderInfoByQuery = async (query: any) => {
  const record = await SaleOrderCollection.findOne(query).lean().exec();
  return record;
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
