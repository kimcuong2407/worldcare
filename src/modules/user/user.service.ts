import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, map, pick } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import UserAddressCollection from './user-address.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';

// Auth service
const getUserProfileById = async (userId: string) => {
  const profile = await UserCollection.findOne({ _id: userId }).lean().exec();
  // const roles = await casbin.enforcer.getRolesForUser(userId);
  const queryBranches: any = await branchService.findBranchAndChild(null, get(profile, 'branchId'));
  return {
    ...profile,
    branches: map(queryBranches, (branch) => pick(branch, ['_id', 'name', 'address']) ),
    // roles,
  }
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
  const { username, phoneNumber, email, companyId, password, groups} = user;
  const encryptedPassword = await bcryptUtil.generateHash(password);
    const userInfo = {
      username: username || phoneNumber,
      phoneNumber: phoneNumber,
      email: email,
      password: encryptedPassword,
      companyId: companyId,
      groups,
    };
  return createUser(userInfo);
}

const createUser = async (user: any) => {
  return makeQuery(UserCollection.create(user));
}
export default {
  getUserProfileById,
  addNewAddress,
  fetchAddressesByUserId,
  updateAddress,
  findUser,
  createUser,
  createUserAccount,
};
