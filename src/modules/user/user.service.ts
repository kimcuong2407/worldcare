import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, map, omitBy, pick } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import UserAddressCollection from './user-address.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';
import employeeService from '../employee/employee.service';
import authService from '../auth/auth.service';
import { ROOT_COMPANY_ID } from '@app/core/constant';
import moment from 'moment';

// Auth service
const getUserProfileById = async (userId: string) => {
  const profile = await UserCollection.findOne({ _id: userId }).lean().exec();
  const { address } = profile;
  // const roles = await casbin.enforcer.getRolesForUser(userId);
  const employee = await employeeService.getEmployeeInfo({ userId: userId }, true);
  const queryBranches: any = await branchService.findBranchAndChild(null, get(profile, 'branchId'), {});
  return {
    ...profile,
    address: addressUtil.formatAddressV2(address),
    ...pick(employee, ['firstName', 'lastName']),
    branches: map(queryBranches, (branch) => pick(branch, ['_id', 'name', 'address'])),
    // roles,
  }
};

// Auth service
const updateUserProfile = async (userId: string, profile: any) => {
  const  { dob } = profile;
  if(dob) {
    profile.dob = moment.utc(dob, 'DD-MM-YYYY').startOf('day').toDate();
  }
  await UserCollection.findByIdAndUpdate(userId, profile).lean().exec();
  // const roles = await casbin.enforcer.getRolesForUser(userId);
  return true;
};
// Auth service
const addNewAddress = async (address: {
  userId: string,
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
    await UserAddressCollection.updateMany({ userId: get(address, 'userId') }, { isPrimary: false });
  }
  return makeQuery(UserAddressCollection.create(address))
};

// Auth service
const fetchAddressesByUserId = async (userId: string) => {
  const addresses = await makeQuery(UserAddressCollection.find({ userId: Types.ObjectId(userId) }).exec());
  return addresses;
};

const updateAddress = async (userId: string, addressId: string, address: any) => {
  if (get(address, 'isPrimary')) {
    await UserAddressCollection.updateMany({ userId: Types.ObjectId(get(address, 'userId')) }, { isPrimary: false });
  }
  return UserAddressCollection.findOneAndUpdate({
    _id: Types.ObjectId(addressId),
    userId,
  },
    {
      $set: address
    });
}

const findUser = async (query: any) => {
  return makeQuery(UserCollection.find(query).lean().exec());
}

const createUserAccount = async (user: any) => {
  const { username, phoneNumber, email, branchId, password, groups } = user;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const userInfo = {
    username: username || phoneNumber,
    phoneNumber: phoneNumber,
    email: email,
    password: encryptedPassword,
    branchId: branchId,
    groups,
  };
  return createUser(userInfo);
}

const createUser = async (user: any) => {
  return makeQuery(UserCollection.create(user));
}

const findUserById = async (userId: string) => {
  return makeQuery(UserCollection.findById(userId).exec());
}


const getUserInfo = async (params: any) => {
  const {
    userId, branchId
  } = params;
  const query: any = {
    _id: Types.ObjectId(userId),
  };

  if (branchId) {
    query['branchId'] = branchId;
  }
  let data = await UserCollection.findOne(query, ['-password'], {
    'populate': [
      { path: 'groups', select: '_id name' },
    ],
  });
  return data;
}

const fetchUser = async (params: any, options: any) => {
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
  if (groups) {
    query['groups'] = {
      $in: groups,
    }
  }
  let data = await UserCollection.paginate(query, {
    ...options,
    projection: ['-password'],
    'populate': [
      { path: 'groups', select: '_id name' },
    ],
  });
  return data;
}


const createStaffAccount = async (inputUser: any) => {
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
    username,
    groups,
    branchId,
    isCustomer,
    address } = inputUser;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const user = {
    username: username || phoneNumber,
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
  const createdUser = await createUser(user);
  return createdUser;
}


const updateStaffAccount = async (userId: string, inputUser: any) => {
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
    username,
    groups,
    branchId,
    address } = inputUser;
  const user = omitBy({
    username: username || phoneNumber,
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
    user.password = encryptedPassword;
  }

  const createdUser = await UserCollection.findByIdAndUpdate(userId, { $set: user }, { new: true });
  return createdUser;
}

const registerUser = async (inputUser: any) => {
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
    username,
    groups,
    address } = inputUser;
  const encryptedPassword = await bcryptUtil.generateHash(password);
  const user = {
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
  const createdUser = await createUser(user);
  return createdUser;
}

const updateUserGroups = async (userId: string, groups: [string], branchId: string) => {
  await authService.removeRoleForUser(userId, branchId);
  return authService.assignUserToGroup(userId, groups, branchId);
}

const updateUserInfo = async (query: any, userInfo: any) => {
  const { username, groups, userId, ...info } = userInfo;
  const user = await UserCollection.findOneAndUpdate(query, { $set: info }, { new: true });

  const { createdAt, updatedAt, ...rest } = get(user, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteUser = async (userId: string) => {
  const data = await UserCollection.findByIdAndUpdate(userId, { $set: { deletedAt: new Date() } });
  return true;
};

export default {
  getUserProfileById,
  addNewAddress,
  fetchAddressesByUserId,
  updateAddress,
  findUser,
  createUser,
  createUserAccount,
  findUserById,
  updateUserProfile,
  deleteUser,
  registerUser,
  fetchUser,
  updateUserGroups,
  createStaffAccount,
  updateStaffAccount,
  getUserInfo,
};
