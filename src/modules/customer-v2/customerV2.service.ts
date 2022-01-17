import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import {isNil, map} from 'lodash';
import get from 'lodash/get';
import CustomerV2Collection from './customerV2.collection';
import {CUSTOMER_V2_STATUS} from './constant';
import {InternalServerError} from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('customerV2.service');

const initCustomerCode = (codeSequence: number) => {
  let s = '000000000' + codeSequence;
  return 'KH' + s.substr(s.length - 6);
}

const autoIncrease = (record: any) => {
  return new Promise(((resolve, reject) => {
    record.setNext('customer_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err);
      }
      const customerCode = initCustomerCode(record.codeSequence)
      const doc = await CustomerV2Collection.findOne({code: customerCode, partnerId: record.partnerId}).exec();
      if (!isNil(doc)) {
        await autoIncrease(record);
      }
      record.code = customerCode;
      await record.save();
      resolve(record);
    });
  })).catch(() => {
    throw new InternalServerError('Failed to increase customer Code.');
  })
}

const persistCustomer = async (customerInfo: any) => {
  const customer = await CustomerV2Collection.create(customerInfo);
  const customerCode = get(customerInfo, 'code', null);
  
  if (isNil(customerCode)) {
    await autoIncrease(customer);
  }

  return {
    ...get(customer, '_doc', {}),
  };
};

const formatCustomer = (customer: any) => {
  if (isNil(customer)) {
    return null;
  }
  customer.address = addressUtil.formatAddressV2(get(customer, 'address'));
  return customer;
}

const createCustomer = async (customerInfo: any) => {
  customerInfo.status = CUSTOMER_V2_STATUS.ACTIVE;
  return await persistCustomer(customerInfo);
}

const fetchCustomers = async (queryInput: any, options: any) => {

  const query: any = {
    status: CUSTOMER_V2_STATUS.ACTIVE,
    partnerId: queryInput.partnerId
  }
  if (queryInput.keyword) {
    query['$or'] = [
      {code: {$regex: '.*' + queryInput.keyword + '.*', $options: 'i'}},
      {name: {$regex: '.*' + queryInput.keyword + '.*', $options: 'i'}},
    ]
  }
  if (queryInput.code) {
    query['code'] = queryInput.code;
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

  const customers = await CustomerV2Collection.paginate(query, {
    ...options,
    sort: {
      name: 1,
    }
  });
  const {docs, ...rest} = customers
  return {
    docs: map(docs, formatCustomer),
    ...rest
  };
}

const getCustomerInfo = async (query: any) => {
  const customer = await CustomerV2Collection.findOne(query)
    .exec();
  return formatCustomer(get(customer, '_doc'));
};

const updateCustomerInfo = async (query: any, customerInfo: any) => {
  const customer = await CustomerV2Collection.findOneAndUpdate(query, {$set: customerInfo}, {new: true});

  const {createdAt, updatedAt, ...rest} = get(customer, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteCustomer = async (customerId: string) => {
  await CustomerV2Collection.findOneAndUpdate({
    _id: customerId,
  }, {
    deletedAt: new Date(),
    status: CUSTOMER_V2_STATUS.DELETED
  });

  return true;
};

const searchCustomer = async (keyword: string, partnerId: number) => {
  return await CustomerV2Collection.find({
    $or: [
      { code: { $regex: '.*' + keyword + '.*', $options: 'i' } },
      { name: { $regex: '.*' + keyword + '.*', $options: 'i' } },
      { phoneNumber: { $regex: '.*' + keyword + '.*', $options: 'i' } },
    ],
    partnerId,
    deletedAt: null
  }).limit(10).lean().exec();
}

export default {
  createCustomer,
  fetchCustomers,
  getCustomerInfo,
  updateCustomerInfo,
  deleteCustomer,
  searchCustomer
};
