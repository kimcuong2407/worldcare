import { DEFAULT_ROLES } from './constant';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated, UnauthorizedError } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { filter, forEach, get, omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import UserCollection from '../user/user.collection';
import userService from '../user/user.service';
import RoleCollection from './roles.collection';
import casbin from '@app/core/casbin';
import { ENTITY_TYPE, ROOT_COMPANY_ID } from '@app/core/constant';
import { Types } from 'mongoose';
import branchService from '../branch/branch.service';
import partnerService from '../partner/partner.service';
import { CLINIC_RESOURCES, PHARMACY_RESOURCES, RESOURCES, CORE_ACTIONS, ROOT_ACTIONS, ACTIONS } from '@app/core/permissions';

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
  if (!user) {
    throw new UnAuthenticated();
  }
  // const partnerId = branchService.findBranchById(get(user, 'branchId'));
  const isPasswordMatched = await bcryptUtil.comparePassword(password, get(user, 'password'));
  if (!isPasswordMatched) {
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
  const user = await UserCollection.findOne({ _id: Types.ObjectId(userId) }).lean().exec();
  if (!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(currentPassword, get(user, 'password'));
  if (!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const encryptedPassword = await bcryptUtil.generateHash(newPassword);

  await UserCollection.updateOne({ _id: Types.ObjectId(userId) }, { $set: { password: encryptedPassword } })
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
    branchId: ROOT_COMPANY_ID,
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

const removeRoleForUser = async (userId: string, domain: string) => {
  return casbin.enforcer.deleteRolesForUser(userId, domain);
}

const createRole = async (branchId: string, roleName: string, description: string) => {
  return makeQuery(RoleCollection.create({
    name: roleName,
    branchId,
    description,
  }));
}

const updateRole = async (roleId: string, name: string, description: string) => {
  const query: any = {
    _id: Types.ObjectId(roleId),
  }
  return makeQuery(RoleCollection.findOneAndUpdate(query, { $set: { name, description } }, { new: true }).exec());
}

const removeRole = async (roleId: string, branchId: string) => {
  await makeQuery(RoleCollection.findByIdAndDelete(roleId).exec());
  await casbin.enforcer.deleteRole(roleId);
  // await casbin.enforcer.removeNamedGroupingPolicy('g', ...[roleId, branchId]);
}


const setupDefaultRoles = async (branchId: string, modules: string[]) => {
  await Promise.all(DEFAULT_ROLES.map(async role => {
    const { name, permissions, } = role;
    const createdRole = await RoleCollection.create({
      name,
      branchId,
    });
    await Promise.all(permissions.map(async per => {
      const { resource, action } = per;
      const policies = action.map(act => ([get(createdRole, '_id'), branchId, resource, act]))
      return Promise.all(policies.map((pol: any) => casbin.enforcer.addPolicy(...pol)));
    }))

    return Promise.resolve();

  }));
  return Promise.resolve();
}


// Auth service
const getRolesByCompany = async (branchId: string) => {
  return makeQuery(RoleCollection.find({ branchId }).lean().exec());
}

const findOneRole = async (roleId: string, branchId?: number) => {
  const query: any = {
    _id: Types.ObjectId(roleId),
  }
  if (branchId) {
    query.branchId = Number(branchId);
  }
  return makeQuery(RoleCollection.findOne(query).lean().exec());
}

// Auth service
const getRolesDetailByCompanyAndId = async (roleId: string, branchId: string) => {
  const query: any = {
    _id: Types.ObjectId(roleId)
  };
  if (branchId) {
    query.branchId = branchId;
  }
  const role = await makeQuery(RoleCollection.findOne(query).lean().exec());
  const policies = await casbin.enforcer.getFilteredPolicy(0, roleId, String(get(role, 'branchId')));
  const formattedPolicies = policies.filter(policy => policy[1] === String(get(role, 'branchId'))).map((policy) => {
    return policy.slice(2);
  });
  const groupedPolicies: any = {};
  formattedPolicies.forEach((policy) => {
    groupedPolicies[get(policy, '0')] = groupedPolicies[get(policy, '0')] || []
    groupedPolicies[get(policy, '0')].push(get(policy, '1'));
  });
  return {
    ...role,
    policies: groupedPolicies,
  };
}

const getRolesByCompanyAndUserId = async (userId: string) => {
  return casbin.enforcer.getRolesForUser(String(userId));
}

const assignParentBranch = async (childBranchId: number, parentBranchId: number) => {
  return casbin.enforcer.addNamedGroupingPolicy('g2', String(childBranchId), String(parentBranchId));
}

const updateParentBranch = async (branchId: number, oldParentBranchId: number, newParentBranchId: number) => {
  await casbin.enforcer.removeNamedGroupingPolicy('g2', String(branchId), String(oldParentBranchId))
  return assignParentBranch(branchId, newParentBranchId);
}
// Auth service
const staffLogin = async (login: string, password: string, branchId: Number) => {

  const sessionId = uuidv4();
  const query: any = {
    $or: [
      {
        username: login
      }
    ],
  };
  if (branchId) {
    query.branchId = branchId;
  }
  const user = await UserCollection.findOne(query).lean().exec();
  if (!user) {
    throw new UnAuthenticated();
  }
  const isPasswordMatched = await bcryptUtil.comparePassword(password, get(user, 'password'));
  if (!isPasswordMatched) {
    throw new UnAuthenticated();
  }
  const userCompany = get(user, 'branchId');
  const groups = get(user, 'groups', []);
  if (!groups || groups.length < 1) {
    throw new UnauthorizedError('Bạn không có quyền truy cập vào trang này.');
  }

  const token = jwtUtil.issueToken(get(user, '_id'), sessionId);

  return {
    userId: get(user, '_id'),
    sessionId,
    token,
    branchId: userCompany,
  }
}

const getResourcesForBranch = async (branchId: number) => {
  const branch = await branchService.findBranchById(branchId);
  const partner = await partnerService.findPartnerById(get(branch, 'partnerId'));

  const modules = get(partner, 'modules', []);
  let resources: any = {};
  forEach(modules, (module) => {
    if (module === ENTITY_TYPE.PHARMACY) {
      resources = {
        ...resources,
        ...PHARMACY_RESOURCES
      };
    }
    if (module === ENTITY_TYPE.CLINIC) {
      resources = {
        ...resources,
        ...CLINIC_RESOURCES
      };
    }
  });

  const actions: any = branchId == ROOT_COMPANY_ID ? ROOT_ACTIONS : CORE_ACTIONS;
  return {
    resources,
    actions,
  };
}

const getTranslatedResourcesAndActionsForBranch = async(branchId: number) => {
  const {resources, actions } = await getResourcesForBranch(branchId);
  const resourceKeys = Object.keys(resources);
  const actionKeys = Object.keys(actions);
  const translatedResource = filter(RESOURCES, (resource: any) => resourceKeys.includes(resource.key));
  const translatedAction = filter(ACTIONS, (action: any) => actionKeys.includes(action.key));

  return {
    resources: translatedResource,
    actions: translatedAction,
  };
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
  createRole,
  updateRole,
  removeRole,
  assignParentBranch,
  updateParentBranch,
  removeRoleForUser,
  getResourcesForBranch,
  getTranslatedResourcesAndActionsForBranch,
};
