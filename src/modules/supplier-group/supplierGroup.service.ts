import loggerHelper from '@utils/logger.util';
import {map} from 'lodash';
import get from 'lodash/get';
import {SUPPLIER_GROUP_STATUS} from '@modules/supplier/constant';
import SupplierGroupCollection from '@modules/supplier-group/supplierGroup.collection';

const logger = loggerHelper.getLogger('supplierGroup.service');

const createSupplierGroup = async (supplierGroupInfo: any) => {
  supplierGroupInfo.status = SUPPLIER_GROUP_STATUS.ACTIVE;
  const supplierGroup = await SupplierGroupCollection.create(supplierGroupInfo);
  return {
    ...get(supplierGroup, '_doc', {}),
  };
}

const fetchSupplierGroups = async (queryInput: any, options: any) => {

  const query: any = {
    status: SUPPLIER_GROUP_STATUS.ACTIVE,
    partnerId: queryInput.partnerId
  }
  if (queryInput.keyword) {
    query['$text'] = {$search: queryInput.keyword}
  }
  if (queryInput.name) {
    query['name'] = queryInput.name;
  }

  const supplierGroups = await SupplierGroupCollection.paginate(query, {
    ...options,
    sort: {
      name: 1,
    }
  });
  const {docs, ...rest} = supplierGroups
  return {
    docs: map(docs, doc => get(doc, '_doc')),
    ...rest
  };
}

const getSupplierGroupInfo = async (query: any) => {
  const supplierGroup = await SupplierGroupCollection.findOne(query).exec();
  return get(supplierGroup, '_doc');
};

const updateSupplierGroupInfo = async (query: any, supplierGroupInfo: any) => {
  const supplier = await SupplierGroupCollection.findOneAndUpdate(query, {$set: supplierGroupInfo}, {new: true});

  const {createdAt, updatedAt, ...rest} = get(supplier, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteSupplierGroup = async (supplierGroupId: string) => {
  await SupplierGroupCollection.findOneAndUpdate({
    _id: supplierGroupId
  }, {
    deletedAt: new Date(),
    status: SUPPLIER_GROUP_STATUS.DELETED
  });

  return true;
};

export default {
  createSupplierGroup,
  fetchSupplierGroups,
  getSupplierGroupInfo,
  updateSupplierGroupInfo,
  deleteSupplierGroup
};
