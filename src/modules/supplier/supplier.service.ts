import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import {isNil, map} from 'lodash';
import get from 'lodash/get';
import SupplierCollection from './supplier.collection';
import {SupplierModel} from './supplier.model';
import makeQuery from '@core/database/query';
import {SUPPLIER_STATUS} from '@modules/supplier/constant';
import { InternalServerError } from '@app/core/types/ErrorTypes';

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

const formatSupplier = (supplier: any) => {
  if (!supplier) {
    return {};
  }
  supplier.address = addressUtil.formatAddressV2(get(supplier, 'address'));
  return supplier;
}

const createSupplier = async (supplierInfo: SupplierModel) => {
  supplierInfo.status = SUPPLIER_STATUS.ACTIVE;
  supplierInfo.totalPurchase = 0;
  supplierInfo.currentDebt = 0;

  return await persistSupplier(supplierInfo);
}

const findSupplierByName = async (name: string) => {
  return makeQuery(SupplierCollection.find({name, deletedAt: null}).exec());
}

const fetchSuppliers = async (queryInput: any, options: any) => {

  const query: any = {
    status: SUPPLIER_STATUS.ACTIVE,
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
    }
  });
  const {docs, ...rest} = suppliers
  return {
    docs: map(docs, formatSupplier),
    ...rest
  };
}

const getSupplierInfo = async (query: any) => {
  const supplier = await SupplierCollection.findOne(query).exec();
  return formatSupplier(supplier);
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
    status: SUPPLIER_STATUS.DELETED
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
