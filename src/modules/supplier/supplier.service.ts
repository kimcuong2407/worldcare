import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import {isNil, map} from 'lodash';
import get from 'lodash/get';
import SupplierCollection from './supplier.collection';
import {SupplierModel} from './supplier.model';
import makeQuery from '@core/database/query';
import {SUPPLIER_GROUP_STATUS} from '@modules/supplier/constant';
import { InternalServerError } from '@app/core/types/ErrorTypes';
import PurchaseOrderCollection from '@modules/purchase-order/purchaseOrder.collection';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';

const logger = loggerHelper.getLogger('supplier.service');

const initSupplierCode = (supplierCodeSeq: number) => {
  let s = '000000000' + supplierCodeSeq;
  return s.substr(s.length - 6);
}

const autoIncrease = (record: any) => {
  return new Promise(((resolve, reject) => {
    record.setNext('supplier_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err);
      }
      const supplierCode = `NCC${initSupplierCode(record.supplierCodeSequence)}`
      const doc = await SupplierCollection.findOne({supplierCode, partnerId: record.partnerId}).exec();
      if (!isNil(doc)) {
        await autoIncrease(record);
      }
      record.supplierCode = supplierCode;
      await record.save();
      resolve(record);
    });
  })).catch(() => {
    throw new InternalServerError('Failed to increase supplierCode.');
  })
}

const persistSupplier = async (supplierInfo: SupplierModel) => {
  const supplierCode = get(supplierInfo, 'supplierCode', null);
  const supplier = await SupplierCollection.create(supplierInfo);
  
  if (isNil(supplierCode)) {
    await autoIncrease(supplier);
  }

  return {
    ...get(supplier, '_doc', {}),
  };
};

const formatSupplier = async (supplier: any) => {
  if (!supplier) {
    return {};
  }
  supplier.address = addressUtil.formatAddressV2(supplier.address);
  const supplierPaymentSummary = await calculateSupplierPaymentSummary(get(supplier, '_id'));
  supplier.totalPurchase = supplierPaymentSummary.totalPurchase;
  supplier.currentDebt = supplierPaymentSummary.currentDebt;

  return supplier;
}

const calculateSupplierPaymentSummary = async (supplierId: string, ) => {
  const query = {
    supplierId: supplierId.toString(),
    status: PURCHASE_ORDER_STATUS.COMPLETED
  }
  const supplierPaymentSummary = await PurchaseOrderCollection.aggregate([
    {
      $match: query
    },
    {
      $project: {
        _id: 0,
        totalPayment: 1,
        currentDebt: 1
      }
    },
    {
      $group: {
        _id: null,
        totalPurchase: {
          $sum: '$totalPayment'
        },
        currentDebt: {
          $sum: {
            $toDouble: '$currentDebt'
          }
        }
      }
    }
  ]).exec();

  if (supplierPaymentSummary.length > 0) {
    const summary = supplierPaymentSummary[0];
    return {
      totalPurchase: summary.totalPurchase ? summary.totalPurchase : 0,
      currentDebt: summary.currentDebt ? summary.currentDebt : 0,
    }
  }
  return {
    totalPurchase: 0,
    currentDebt: 0
  };
}

const createSupplier = async (supplierInfo: SupplierModel) => {
  supplierInfo.status = SUPPLIER_GROUP_STATUS.ACTIVE;
  supplierInfo.totalPurchase = 0;
  supplierInfo.currentDebt = 0;

  return await persistSupplier(supplierInfo);
}

const findSupplierByName = async (name: string) => {
  return makeQuery(SupplierCollection.find({name, deletedAt: null}).exec());
}

const fetchSuppliers = async (queryInput: any, options: any) => {

  const query: any = {
    deletedAt: null,
    partnerId: queryInput.partnerId
  }
  if (queryInput.keyword) {
    query['$text'] = {$search: queryInput.keyword}
  }
  if (queryInput.supplierCode) {
    query['supplierCode'] = queryInput.supplierCode;
  }
  if (queryInput.name) {
    query['name'] = queryInput.name;
  }
  if (queryInput.phoneNumber) {
    query['phoneNumber'] = queryInput.phoneNumber;
  }
  if (queryInput.email) {
    query['email'] = queryInput.email;
  }

  const suppliers = await SupplierCollection.paginate(query, {
    ...options,
    sort: {
      name: 1,
    },
    populate: [
      { path: 'supplierGroup'},
    ],
    lean: true
  });
  const {docs, ...rest} = suppliers
  const resultDocs = [];
  for (const doc of docs) {
    resultDocs.push(await formatSupplier(doc));
  }
  return {
    docs: resultDocs,
    ...rest
  };
}

const getSupplierInfo = async (query: any) => {
  const supplier = await SupplierCollection.findOne(query)
    .populate('supplierGroup')
    .exec();
  return await formatSupplier(get(supplier, '_doc'));
};

const updateSupplierInfo = async (query: any, supplierInfo: any) => {
  const supplier = await SupplierCollection.findOneAndUpdate(query, {$set: supplierInfo}, {new: true});
  

  const {createdAt, updatedAt, ...rest} = get(supplier, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteSupplier = async (supplierId: string) => {
  await SupplierCollection.findOneAndUpdate({
    _id: supplierId,
  }, {
    deletedAt: new Date(),
    status: SUPPLIER_GROUP_STATUS.DELETED
  });

  return true;
};

export default {
  createSupplier,
  findSupplierByName,
  fetchSuppliers,
  getSupplierInfo,
  updateSupplierInfo,
  deleteSupplier
};
