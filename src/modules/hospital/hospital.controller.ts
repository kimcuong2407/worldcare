import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import hospitalService from './hospital.service';
import omit from 'lodash/omit';

const logger = loggerHelper.getLogger('user.controller');

const createHospitalAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    res.send(setResponse({}));
  } catch (e) {
    logger.error('createHospitalAction', e);
    next(e);
  }
};

export default { createHospitalAction };
