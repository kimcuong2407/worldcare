/* eslint-disable max-len */
import loggerHelper from '@utils/logger.util';
import express from 'express';
import { get } from 'lodash';
import jsonwebtoken from 'jsonwebtoken';
import authService from '@modules/auth/auth.service';
import jwtUtil from '@app/utils/jwt.util';
import { UnauthorizedError } from '../types/ErrorTypes';

const logger = loggerHelper.getLogger('middleware.authorization');

const authorizationMiddleware = (permission: string, resource?: string) => async (req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {
  const token: string = get(req, 'headers.authorization');
  const hospitalId: string = get(req, 'headers.hospitalId') || '';

  try {
    const jwtToken = token ? token.split(' ')[1] : '';

    const user: any = jwtUtil.verifyToken(jwtToken);

    if (!user) {
      throw new UnauthorizedError();
    }

    req.token = token;
    req.user = {
      id: get(user, 'sub'),
      sessionId: get(user, 'jti'),
    };
    next();
  } catch (error) {
    logger.error('authorizationMiddleware ERROR', error);
    next(error);
  }
};

export default { authorizationMiddleware };
