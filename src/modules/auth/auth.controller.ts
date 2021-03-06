import express from 'express';
import loggerHelper from '@utils/logger.util';
import authService from './auth.service';
import { InternalServerError, NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import { setResponse } from '@app/utils/response.util';
import casbin from '@app/core/casbin';
import { find, get, groupBy, map } from 'lodash';
import userService from '../user/user.service';
import companyService from '../branch/branch.service';
import { ACTIONS, RESOURCES } from '@app/core/permissions';

const logger = loggerHelper.getLogger('server.controller');

const loginAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      login, password
    } = req.body;
    if (!login || !password) {
      throw new ValidationFailedError('Login and password are required.');
    }
    const auth = await authService.authenticate(login, password)
    res.send(auth);
  } catch (e) {
    logger.error('LoginAction', e);
    next(e);
  }
};


const fetchHospitalRolesAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const userId = get(req.user, 'id');
    const companyId: string = get(req, 'companyId');
    console.log(userId)
    const roles = await casbin.enforcer.getRolesForUser(userId, companyId);
    res.send(roles);
  } catch (e) {
    logger.error('fetchHospitalRolesAction', e);
    next(e);
  }
};

const createHospitalRolesAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const roles = await casbin.enforcer.getFilteredGroupingPolicy(2, 'tenant1');
    res.send(map(roles, (role) => get(role, 2)));
  } catch (e) {
    logger.error('createHospitalRolesAction', e);
    next(e);
  }
};

const assignPermissionToRoleAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const {
      action,
      resource,
    } = req.body;
    const companyId = req.isRoot ? null : req.companyId;
    const roleId = get(req.params, 'groupId');
    const role = await authService.findOneRole(roleId);
    if(!role) {
      throw new ValidationFailedError('Kh??ng t??m th???y nh??m ng?????i d??ng.');
    }
    const {  actions, resources } = await authService.getResourcesForBranch(get(role, 'branchId'));
    if(!resources[resource]) {
      throw new ValidationFailedError('D??? li???u kh??ng ???????c ph??p c???p nh???t.');
    }

    if(!actions[action]) {
      throw new ValidationFailedError('D??? li???u kh??ng ???????c ph??p c???p nh???t.');
    }
    await casbin.enforcer.addPolicy(...[roleId, String(get(role, 'branchId')), resource, action]);
    await casbin.enforcer.loadPolicy();
    return res.send(true);
  } catch (e) {
    logger.error('assignPermissionToRoleAction', e);
    next(e);
  }
};


const removePermissionToRoleAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const {
      action,
      resource,
    } = req.body;
    const branchId = req.isRoot ? null : req.companyId;
    const roleId = get(req.params, 'groupId');
    const role = await authService.findOneRole(roleId, branchId);
    if(!role) {
      throw new ValidationFailedError('Kh??ng t??m th???y nh??m ng?????i d??ng.');
    }
    await casbin.enforcer.removePolicy(...[roleId, String(get(role, 'branchId')), resource, action]);
    await casbin.enforcer.loadPolicy();
    return res.send(true);
  } catch (e) {
    logger.error('removePermissionToRoleAction', e);
    next(e);
  }
};


const authorizationAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {

    const {
      role,
      action,
      resource,
      domain,
    } = req.body;
    const policy = await casbin.enforcer.enforce(role, domain, resource, action);
    res.send(policy);
  } catch (e) {
    logger.error('authorizationAction', e);
    next(e);
  }
};

const assignUserToGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {

    const {
      userId,
      role,
      domain,
    } = req.body;

    const policy = await casbin.enforcer.addRoleForUser(userId, role, domain);
    res.send(policy);
  } catch (e) {
    logger.error('assignUserToGroupAction', e);
    next(e);
  }
};

const fetchPolicyAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const userId = get(req.user, 'id');
    // const companyId: string = get(req, 'companyId');
    // await casbin.enforcer.addNamedGroupingPolicy('g2', "10062", "888888");
    const user = await userService.findUserById(userId);
    const companyId = get(user, 'branchId');
    if(!user || !companyId) {
      return {};
    }
    const policies = await casbin.enforcer.getImplicitPermissionsForUser(userId);
    const formattedPolicies = policies.filter(policy => policy[1] === String(companyId)).map((policy) => {
      return policy.slice(2)
    });
    const groupedPolicies: any = {};
    formattedPolicies.forEach((policy) => {
      groupedPolicies[get(policy, '0')] = groupedPolicies[get(policy, '0')] || []
      groupedPolicies[get(policy, '0')].push(get(policy, '1'));
    });
    res.send(groupedPolicies)
  } catch (e) {
    logger.error('fetchPolicyAction', e);
    next(e);
  }
};

const changePasswordAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const userId = req.user.id;

    if (!currentPassword) {
      throw new ValidationFailedError('Vui l??ng nh???p v??o m???t kh???u hi???n t???i.');
    }

    if (!newPassword) {
      throw new ValidationFailedError('Vui l??ng nh???p v??o m???t kh???u m???i.');
    }
    const status = await authService.changePasswordByUserId(userId, currentPassword, newPassword);
    res.send(status);
  } catch (e) {
    logger.error('changePasswordAction', e);
    next(e);
  }
};


const staffLoginAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      login, password, companyId
    } = req.body;
    
    if (!login || !password) {
      throw new ValidationFailedError('Vui l??ng nh???p v??o t??n ????ng nh???p v?? m???t kh???u.');
    }
    const auth = await authService.staffLogin(login, password, companyId)
    res.send(auth);
  } catch (e) {
    logger.error('LoginAction', e);
    next(e);
  }
};


const getResourcePermissionAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let entityId = get(req.query, 'branchId') || req.companyId;
    // console.log(entityId, req.isRoot)

    if(!req.isRoot) {
      entityId = req.companyId;
    }
    const resources = await authService.getTranslatedResourcesAndActionsForBranch(Number(entityId));
    res.send(resources);
  } catch (e) {
    logger.error('getResourcePermissionAction', e);
    next(e);
  }
};
const fetchUserGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let entityId = get(req.query, 'branchId') || req.companyId;

    if(!req.isRoot) {
      entityId = req.companyId;
    }

    const role = await authService.getRolesByCompany(entityId);
    res.send(role);
  } catch (e) {
    logger.error('createUserGroupAction', e);
    next(e);
  }
};

const createUserGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, description, branchId } = req.body;
    let entityId = branchId || req.companyId;
    if(!req.isRoot) {
      entityId = req.companyId;
    }

    const role = await authService.createRole(entityId, name, description);
    res.send(role);
  } catch (e) {
    logger.error('createUserGroupAction', e);
    next(e);
  }
};

const updateUserGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let entityId = req.companyId;
    const { groupId } = req.params;
    const { name, description } = req.body;

    if(req.isRoot) {
      entityId = null;
    }
    const role = await authService.findOneRole(groupId, entityId);
    if (!role) {
      throw new NotFoundError()
    }

    const newRole = await authService.updateRole(groupId, name, description);
    res.send(setResponse(newRole, true));
  } catch (e) {
    logger.error('updateUserGroupAction', e);
    next(e);
  }
};


const deleteUserGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let entityId = req.companyId;
    const { groupId } = req.params;
    const { name, description } = req.body;

    if(req.isRoot) {
      entityId = null;
    }
    const role = await authService.findOneRole(groupId, entityId);
    if (!role) {
      throw new NotFoundError()
    }

    await authService.removeRole(groupId, get(role, 'companyId'));
    res.send(setResponse(null, true));
  } catch (e) {
    logger.error('updateUserGroupAction', e);
    next(e);
  }
};

const getUserGroupDetailAction = async(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try{
  let branchId = get(req.query, 'branchId');

  if(!req.isRoot) {
    branchId = req.companyId;
  }
  const groupId = get(req.params, 'groupId');

  const role = await authService.getRolesDetailByCompanyAndId(groupId, branchId);
  res.send(role);
} catch (e) {
  logger.error('getUserGroupDetailAction', e);
  next(e);
}
}

export default {
  loginAction,
  fetchHospitalRolesAction,
  createHospitalRolesAction,
  assignPermissionToRoleAction,
  authorizationAction,
  assignUserToGroupAction,
  fetchPolicyAction,
  changePasswordAction,
  staffLoginAction,
  getResourcePermissionAction,
  removePermissionToRoleAction,
  createUserGroupAction,
  updateUserGroupAction,
  deleteUserGroupAction,
  fetchUserGroupAction,
  getUserGroupDetailAction,
};
