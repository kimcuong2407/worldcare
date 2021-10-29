import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, map, omitBy, pick } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CustomerCollection from '../customer/customer.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';
import employeeService from '../employee/employee.service';
import authService from '../auth/auth.service';
import { ROOT_COMPANY_ID } from '@app/core/constant';

const findCustomer = async (query: any) => {
  return makeQuery(CustomerCollection.find(query).lean().exec());
}

const createCustomerAccount = async (customer: any) => {
  const { customername, phoneNumber, email, branchId, password, groups } = customer;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const customerInfo = {
    customername: customername || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    password: encryptedPassword,
    branchId: branchId,
    groups,
  };
  return createCustomer(customerInfo);
}

const createCustomer = async (customer: any) => {
  return makeQuery(CustomerCollection.create(customer));
}

const findCustomerById = async (customerId: string) => {
  return makeQuery(CustomerCollection.findById(customerId).exec());
}


const getCustomerInfo = async (params: any) => {
  const {
    customerId, branchId
  } = params;
  const query: any = {
    _id: Types.ObjectId(customerId),
  };

  if (branchId) {
    query['branchId'] = branchId;
  }
  let data = await CustomerCollection.findOne(query, ['-password'], {
    'populate': [
      { path: 'groups', select: '_id name' },
    ],
  });
  return data;
}

const fetchCustomer = async (params: any, options: any) => {
  const {
    keyword, branchId, groups
  } = params;
  const query: any = {
  };
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  if (branchId) {
    query['branchId'] = branchId;
  }
  let data = await CustomerCollection.paginate(query, {
    ...options,
  });
  return data;
}

const updateCustomerInfo = async (query: any, customerInfo: any) => {
  const { customername, groups, customerId, ...info } = customerInfo;
  const customer = await CustomerCollection.findOneAndUpdate(query, { $set: info }, { new: true });

  const { createdAt, updatedAt, ...rest } = get(customer, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteCustomer = async (customerId: string) => {
  const data = await CustomerCollection.findByIdAndUpdate(customerId, { $set: { deletedAt: new Date() } });
  return true;
};

export default {
  findCustomer,
  createCustomer,
  createCustomerAccount,
  findCustomerById,
  deleteCustomer,
  fetchCustomer,
  getCustomerInfo,
};
