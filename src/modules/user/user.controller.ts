import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import userService from './user.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';

const logger = loggerHelper.getLogger('user.controller');

const getProfileAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
  ) => {
  try {
    const user = await userService.getUserProfileById(get(req.user, 'id'));
    
    res.send(omit(user, 'password'));
  } catch (e) {
    logger.error('getProfileAction', e);
    next(e);
  }
};

export default { getProfileAction };
