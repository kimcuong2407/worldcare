import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import generalService from './general.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('general.controller');

const fetchHomepageContentAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    
    res.send(general);
  } catch (e) {
    logger.error('createAppointmentAction', e);
    next(e);
  }
};


export default {
  fetchHomepageContentAction
}