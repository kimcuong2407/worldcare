import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, map } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import UserAddressCollection from './user-address.collection';
import addressUtil from '@utils/address.util';

// Auth service
const getUserProfileById = async (userId: string) => {
  const profile = await UserCollection.findOne({ _id: userId }).lean().exec();
  const roles = await casbin.enforcer.getRolesForUser(userId);
  return {
    ...profile,
    roles,
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
  const addresses = await makeQuery(UserAddressCollection.find({ userId: Types.ObjectId(userId) }).lean().exec());
  return map(addresses, addressUtil.formatAddressV2);
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
};
