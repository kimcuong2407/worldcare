import express from 'express';
import loggerHelper from '@utils/logger.util';
import authService from './auth.service';
import { InternalServerError, ValidationFailedError } from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('server.controller');

const loginAction = (req: express.Request, res: express.Response): void => {
  try {
    const {
      login, password
    } = req.body;
    if(!login || !password) {
      throw new ValidationFailedError('Login and password are required.');
    }

    const auth = authService.authenticate(login, password)
    res.send(auth);
  } catch (e) {
    logger.error('LoginAction', e);
    throw new InternalServerError(e || 'Error');
  }
};

export default { loginAction };
