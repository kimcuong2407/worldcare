import { DEFAULT_ROLES } from './constant';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated, UnauthorizedError } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import userService from '../user/user.service';
import RoleCollection from './roles.collection';
import casbin from '@app/core/casbin';
import { ROOT_COMPANY_ID } from '@app/core/constant';
import { Types } from 'mongoose';

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


const changePasswordByUserId = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await UserCollection.findOne({ _id: Types.ObjectId(userId)}).lean().exec();
  if(!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(currentPassword, get(user, 'password'));
  if(!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const encryptedPassword = await bcryptUtil.generateHash(newPassword);

  await UserCollection.updateOne({ _id: Types.ObjectId(userId)}, {$set: { password: encryptedPassword }})
  return true;
}


// Auth service
const registerUser = async (inputUser: any) => {
  const { phoneNumber, password, email, firstName, lastName } = inputUser;
  const sessionId = uuidv4();
  const encryptedPassword = await bcryptUtil.generateHash(password);
    const user = {
      username: phoneNumber,
      phoneNumber: phoneNumber,
      email: email,
      password: encryptedPassword,
      companyId: ROOT_COMPANY_ID,
      firstName,
      lastName,
    };
  const createdUser = await userService.createUser(user);
  const token = jwtUtil.issueToken(get(createdUser, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token
  }
}


const assignUserToGroup = async (userId: string, roles: [string], domain: string) => {
  return Promise.all(roles.map((role) => casbin.enforcer.addRoleForUser(userId, role, domain)));
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
  return makeQuery(RoleCollection.find({companyId}).lean().exec());
}

const findOneRole = async (roleId: string, companyId: string) => {
  const query: any = {
    _id: Types.ObjectId(roleId),
  }
  if(companyId) {
    query.companyId = companyId;
  }
  return makeQuery(RoleCollection.findOne(query).lean().exec());
}

// Auth service
const getRolesDetailByCompanyAndId = async (companyId: string, roleId: string) => {
  const role = await makeQuery(RoleCollection.find({companyId, _id: Types.ObjectId(roleId)}).lean().exec());
  const policies = await casbin.enforcer.getFilteredPolicy(0, roleId, companyId);
  const formattedPolicies = policies.filter(policy => policy[1] === companyId).map((policy) => {
    return policy.slice(2)
  });
  const groupedPolicies: any = {};
  formattedPolicies.forEach((policy) => {
    groupedPolicies[get(policy, '0')] = groupedPolicies[get(policy, '0')] || []
    groupedPolicies[get(policy, '0')].push(get(policy, '1'));
  });
  return groupedPolicies;
}

const getRolesByCompanyAndUserId = async (userId: string) => {
  return casbin.enforcer.getRolesForUser(String(userId));
}

// Auth service
const staffLogin = async (login: string, password: string, companyId: Number) => {

  const sessionId = uuidv4();
  const query: any = {
    $or: [
      {
        username: login
      }
    ],
  };
  if(companyId) {
    query.companyId = companyId;
  }
  const user = await UserCollection.findOne(query).lean().exec();
  if(!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(password, get(user, 'password'));
  if(!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const userCompany = get(user, 'companyId');
  const groups = await getRolesByCompanyAndUserId(get(user,'_id'));
  if (!groups || groups.length < 1) {
    throw new UnauthorizedError('Bạn không có quyền truy cập vào trang này.');
  }

  const token = jwtUtil.issueToken(get(user, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token,
    companyId: userCompany,
  }
}
export default {
  authenticate,
  registerUser,
  setupDefaultRoles,
  getRolesByCompany,
  getRolesDetailByCompanyAndId,
  changePasswordByUserId,
  assignUserToGroup,
  staffLogin,
  findOneRole,
};
