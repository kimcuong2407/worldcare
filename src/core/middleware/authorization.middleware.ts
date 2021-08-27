/* eslint-disable max-len */
import loggerHelper from '@utils/logger.util';
import express from 'express';
import { find, get, map, reduce } from 'lodash';
import jsonwebtoken from 'jsonwebtoken';
import authService from '@modules/auth/auth.service';
import jwtUtil from '@app/utils/jwt.util';
import { ForbiddenError, UnauthorizedError } from '../types/ErrorTypes';
import casbin from '../casbin';
import { ROOT_COMPANY_ID } from '../constant';

const logger = loggerHelper.getLogger('middleware.authorization');

const authorizationMiddleware = (rules: Array<[string, string]>) => async (req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {
  const token: string = get(req, 'headers.authorization');
  const companyId: string = get(req, 'headers.companyid') || '';
  try {
    const jwtToken = token ? token.split(' ')[1] : '';

    const user: any = jwtUtil.verifyToken(jwtToken);

    if (!user) {
      throw new UnauthorizedError();
    }

    const isEnforced = await Promise.all(map(rules, rule => {
      return casbin.enforcer.enforce(get(user, 'id'), companyId, rule[0], rule[1]);
    }));
    const isPermitted = find(isEnforced, (val) => val == true);
    if (!isPermitted) {
      throw new ForbiddenError();
    }
    req.companyId = companyId;

    req.isRoot = Number(companyId) === ROOT_COMPANY_ID;
    req.token = token;
    req.user = {
      id: get(user, 'id'),
      sessionId: get(user, 'jti'),
    };
    next();
  } catch (error) {
    logger.error('authorizationMiddleware ERROR', error);
    next(error);
  }
};

export default authorizationMiddleware;
