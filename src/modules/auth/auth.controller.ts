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
    const roles = await casbin.enforcer.getFilteredGroupingPolicy(2, 'tenant1');
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
export default { loginAction, fetchHospitalRolesAction, createHospitalRolesAction };
