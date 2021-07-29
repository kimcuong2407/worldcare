import express from 'express';
import loggerHelper from '@utils/logger.util';
import authService from './auth.service';
import { InternalServerError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import { setResponse } from '@app/utils/response.util';
import casbin from '@app/core/casbin';
import { get, map } from 'lodash';

const logger = loggerHelper.getLogger('server.controller');

const loginAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      login, password
    } = req.body;
    if(!login || !password) {
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

    const roles = await casbin.enforcer.getFilteredGroupingPolicy(userId, companyId);
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
      role,
      action,
      resource,
      domain,
    } = req.body;
    
    const policy = await casbin.enforcer.addPolicy(role, domain, resource,action);
    console.log(policy)
    res.send(policy);
  } catch (e) {
    logger.error('assignPermissionToRoleAction', e);
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
    console.log(policy)
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
    const companyId: string = get(req, 'companyId');

    await casbin.enforcer.addRoleForUser(userId, 'admin', companyId);
    const policies = await casbin.enforcer.getImplicitPermissionsForUser(userId);
    res.send(policies.filter(policy => policy[1] === companyId).map((policy) => {
      return policy.slice(2)
    }))
  } catch (e) {
    logger.error('fetchPolicyAction', e);
    next(e);
  }
};

export default { 
  loginAction,
  fetchHospitalRolesAction,
  createHospitalRolesAction,
  assignPermissionToRoleAction,
  authorizationAction,
  assignUserToGroupAction,
  fetchPolicyAction,
};
