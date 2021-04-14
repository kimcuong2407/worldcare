import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import degreeService from './degree.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('degree.controller');

const createDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  try {
    const degree = await degreeService.createDegreeAction(req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const updateDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.updateDegreeById(degreeId, req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const fetchDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  try {
    const degrees = await degreeService.getDegree(
      [
        'name',
        'incrementId'
      ]
    );

    res.send(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const getDegreeByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.getDegreeById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};
export default { createDegreeAction, fetchDegreeAction, updateDegreeAction, getDegreeByIdAction };
