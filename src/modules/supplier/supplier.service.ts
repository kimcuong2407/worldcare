import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import {map} from 'lodash';
import get from 'lodash/get';
import SupplierCollection from './supplier.collection';
import {SupplierModel} from './supplier.model';
import makeQuery from '@core/database/query';
import {SUPPLIER_STATUS} from '@modules/supplier/constant';

const logger = loggerHelper.getLogger('supplier.service');

const createSupplier = async (supplierInfo: SupplierModel) => {
  logger.info(`Creating supplier with ID=${supplierInfo.supplierId} and name =${supplierInfo.name}`);
  supplierInfo.status = SUPPLIER_STATUS.ACTIVE;
  supplierInfo.totalPurchase = 0;
  supplierInfo.currentDebt = 0;

  return await persistSupplier(supplierInfo);
}

const initSupplierId = (supplierIdSeq: number) => {
  let s = '000000000' + supplierIdSeq;
  return s.substr(s.length - 6);
}

const persistSupplier = async (supplierInfo: SupplierModel) => {
  const supplier = await SupplierCollection.create(supplierInfo);
  supplier.supplierId = `NCC${initSupplierId(supplier.supplierIdSequence)}`;
  supplier.save();

  const {...rest} = get(supplier, '_doc', {});
  return {
    ...rest,
  };
};

const findSupplierByName = async (name: string) => {
  return makeQuery(SupplierCollection.find({name, deletedAt: null}).exec());
}

const fetchSuppliers = async (queryInput: any, options: any) => {

  const query: any = {
    deletedAt: null,
  }
  if (queryInput.keyword) {
    query['$text'] = {$search: queryInput.keyword}
  }
  if (queryInput.supplierId) {
    query['supplierId'] = queryInput.supplierId;
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

const formatSupplier = (supplier: any) => {
  if (!supplier) {
    return {};
  }
  supplier.address = addressUtil.formatAddressV2(get(supplier, 'address'));
  return supplier;
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
    supplierId: supplierId,
  }, {deletedAt: new Date()});

  return true;
};

export default {
  createSupplier,
  findSupplierByName,
  getSupplierInfo,
  updateSupplierInfo,
  deleteSupplier,
  fetchSuppliers
};