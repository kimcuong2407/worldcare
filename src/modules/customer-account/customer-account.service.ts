import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, map, omitBy, pick } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CustomerAccountCollection from './customer-account.collection';
import CustomerAccountAddressCollection from './customer-address.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';
import employeeService from '../employee/employee.service';
import authService from '../auth/auth.service';
import { ROOT_COMPANY_ID } from '@app/core/constant';
import moment from 'moment';

// Auth service
const getCustomerAccountProfileById = async (customerAccountId: string) => {
  const profile = await CustomerAccountCollection.findOne({ _id: customerAccountId }).lean().exec();
  const { address } = profile;
  // const roles = await casbin.enforcer.getRolesForCustomerAccount(customerAccountId);
  const employee = await employeeService.getEmployeeInfo({ customerAccountId: customerAccountId }, true);
  return {
    ...profile,
    address: addressUtil.formatAddressV2(address),
    ...pick(employee, ['firstName', 'lastName']),
    // roles,
  }
};

// Auth service
const updateCustomerAccountProfile = async (customerAccountId: string, profile: any) => {
  const  { dob } = profile;
  if(dob) {
    profile.dob = moment.utc(dob, 'DD-MM-YYYY').startOf('day').toDate();
  }
  await CustomerAccountCollection.findByIdAndUpdate(customerAccountId, profile).lean().exec();
  // const roles = await casbin.enforcer.getRolesForCustomerAccount(customerAccountId);
  return true;
};
// Auth service
const addNewAddress = async (address: {
  customerAccountId: string,
  street: string,
  cityId: string,
  districtId: string,
  wardId: string,
  isPrimary: Boolean,
  fullName: string,
  phoneNumber: string,
  email: string,
}) => {
  if (get(address, 'isPrimary')) {
    await CustomerAccountAddressCollection.updateMany({ customerAccountId: get(address, 'customerAccountId') }, { isPrimary: false });
  }
  return makeQuery(CustomerAccountAddressCollection.create(address))
};

// Auth service
const fetchAddressesByCustomerAccountId = async (customerAccountId: string) => {
  const addresses = await makeQuery(CustomerAccountAddressCollection.find({ customerAccountId: Types.ObjectId(customerAccountId) }).exec());
  return addresses;
};

const updateAddress = async (customerAccountId: string, addressId: string, address: any) => {
  if (get(address, 'isPrimary')) {
    await CustomerAccountAddressCollection.updateMany({ customerAccountId: Types.ObjectId(customerAccountId) }, { isPrimary: false });
  }
  console.log(customerAccountId, addressId, address)
  return CustomerAccountAddressCollection.findOneAndUpdate({
    _id: Types.ObjectId(addressId),
    customerAccountId: Types.ObjectId(customerAccountId),
  },
    {
      $set: address
    });
}

const findCustomerAccount = async (query: any) => {
  return makeQuery(CustomerAccountCollection.find(query).lean().exec());
}

const createCustomerAccountAccount = async (customerAccount: any) => {
  const { customerAccountname, phoneNumber, email, branchId, password, groups } = customerAccount;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const customerAccountInfo = {
    customerAccountname: customerAccountname || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    password: encryptedPassword,
    branchId: branchId,
    groups,
  };
  return createCustomerAccount(customerAccountInfo);
}

const createCustomerAccount = async (customerAccount: any) => {
  return makeQuery(CustomerAccountCollection.create(customerAccount));
}

const findCustomerAccountById = async (customerAccountId: string) => {
  return makeQuery(CustomerAccountCollection.findById(customerAccountId).exec());
}


const getCustomerAccountInfo = async (params: any) => {
  const {
    customerAccountId, branchId
  } = params;
  const query: any = {
    _id: Types.ObjectId(customerAccountId),
  };

  if (branchId) {
    query['branchId'] = branchId;
  }
  let data = await CustomerAccountCollection.findOne(query, ['-password'], {
    'populate': [
      { path: 'groups', select: '_id name' },
    ],
  });
  return data;
}


const changePasswordByCustomerAccountId = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await CustomerAccountCollection.findOne({ _id: Types.ObjectId(userId) }).lean().exec();
  if (!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(currentPassword, get(user, 'password'));
  if (!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const encryptedPassword = await bcryptUtil.generateHash(newPassword);

  await CustomerAccountCollection.updateOne({ _id: Types.ObjectId(userId) }, { $set: { password: encryptedPassword } })
  return true;
}

const fetchCustomerAccount = async (params: any, options: any) => {
  const {
    keyword, branchId, groups
  } = params;
  const query: any = {
    deletedAt: null,
  };
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  if (branchId) {
    query['branchId'] = branchId;
  }
  if (groups) {
    query['groups'] = {
      $in: groups,
    }
  }
  let data = await CustomerAccountCollection.paginate(query, {
    ...options,
    projection: ['-password'],
    'populate': [
      { path: 'groups', select: '_id name' },
    ],
  });
  return data;
}


const createStaffAccount = async (inputCustomerAccount: any) => {
  const {
    phoneNumber,
    password,
    email,
    firstName,
    lastName,
    fullName,
    gender,
    avatar,
    employeeNumber,
    customerAccountname,
    groups,
    branchId,
    isCustomer,
    address } = inputCustomerAccount;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const customerAccount = {
    customerAccountname: customerAccountname || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    password: encryptedPassword,
    branchId: branchId,
    firstName,
    lastName,
    fullName: fullName || `${lastName || ''} ${firstName || ''}`,
    gender,
    avatar,
    employeeNumber,
    groups,
    isCustomer,
    address
  };
  const createdCustomerAccount = await createCustomerAccount(customerAccount);
  return createdCustomerAccount;
}


const updateStaffAccount = async (customerAccountId: string, inputCustomerAccount: any) => {
  const {
    phoneNumber,
    password,
    email,
    firstName,
    lastName,
    fullName,
    gender,
    avatar,
    employeeNumber,
    customerAccountname,
    groups,
    branchId,
    address } = inputCustomerAccount;
  const customerAccount = omitBy({
    customerAccountname: customerAccountname || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    branchId: branchId,
    firstName,
    lastName,
    fullName: fullName || `${lastName || ''} ${firstName || ''}`,
    gender,
    avatar,
    employeeNumber,
    groups,
    address
  }, isNil);

  if (password) {
    const encryptedPassword = await bcryptUtil.generateHash(password);
    customerAccount.password = encryptedPassword;
  }

  const createdCustomerAccount = await CustomerAccountCollection.findByIdAndUpdate(customerAccountId, { $set: customerAccount }, { new: true });
  return createdCustomerAccount;
}

const registerCustomerAccount = async (inputCustomerAccount: any) => {
  const {
    phoneNumber,
    password,
    email,
    firstName,
    lastName,
    fullName,
    username,
    gender,
    avatar,
    employeeNumber,
    customerAccountname,
    groups,
    address } = inputCustomerAccount;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const customerAccount = {
    username: username || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    password: encryptedPassword,
    branchId: ROOT_COMPANY_ID,
    firstName,
    lastName,
    fullName: fullName || `${lastName || ''} ${firstName || ''}`,
    gender,
    avatar,
    employeeNumber,
    groups,
    address
  };
  const createdCustomerAccount = await createCustomerAccount(customerAccount);
  return createdCustomerAccount;
}

export default {
  getCustomerAccountProfileById,
  addNewAddress,
  fetchAddressesByCustomerAccountId,
  updateAddress,
  findCustomerAccount,
  createCustomerAccount,
  createCustomerAccountAccount,
  findCustomerAccountById,
  updateCustomerAccountProfile,
  registerCustomerAccount,
  fetchCustomerAccount,
  createStaffAccount,
  updateStaffAccount,
  getCustomerAccountInfo,
  changePasswordByCustomerAccountId,
};
