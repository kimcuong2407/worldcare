import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('general.controller');

const getSpecialityAndHospital = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {

    res.send([]);
  } catch (e) {
    logger.error('getSpecialityAndHospital', e);
    next(e);
  }
};


export default {
  getSpecialityAndHospital,
}