import { DEFAULT_ROLES } from './constant';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import userService from '../user/user.service';
import RoleCollection from './roles.collection';
import casbin from '@app/core/casbin';
import { ROOT_COMPANY_ID } from '@app/core/constant';

// Auth service
const authenticate = async (login: string, password: string) => {
  const sessionId = uuidv4();
  const user = await UserCollection.findOne({
    $or: [
      {
        phoneNumber: login,
      },
      {
        email: login,
      },
      {
        username: login
      }
    ]
  }).lean().exec();
  if(!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(password, get(user, 'password'));
  if(!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const token = jwtUtil.issueToken(get(user, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token
  }
}


// Auth service
const registerUser = async (phoneNumber: string, email: string, password: string) => {
  const sessionId = uuidv4();
  const encryptedPassword = await bcryptUtil.generateHash(password);
    const user = {
      username: phoneNumber,
      phoneNumber: phoneNumber,
      email: email,
      password: encryptedPassword,
      companyId: ROOT_COMPANY_ID,
    };
  const createdUser = await userService.createUser(user);
  const token = jwtUtil.issueToken(get(createdUser, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token
  }
}


// Auth service
const setupDefaultRoles = async (companyId: string) => {
  await Promise.all(DEFAULT_ROLES.map( async role => {
    const { name, permissions, } = role;
    const createdRole = await RoleCollection.create({
      name,
      companyId,
    });
    await Promise.all(permissions.map(async per => {
      const { resource, action } = per;
      const policies = action.map(act => ([get(createdRole, '_id'), companyId, resource, act]))
      return Promise.all(policies.map((pol: any) => casbin.enforcer.addPolicy(...pol)));
    }))

    return Promise.resolve();

  }));
  return Promise.resolve();
}


// Auth service
const getRolesByCompany = async (companyId: string) => {
  return makeQuery(RoleCollection.find({companyId}).lean());
}

export default {
  authenticate,
  registerUser,
  setupDefaultRoles,
  getRolesByCompany,
};
