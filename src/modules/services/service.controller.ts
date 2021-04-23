import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import serviceService from './service.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('degree.controller');

// DEGREE
const createServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await serviceService.createService(req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const updateServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await serviceService.updateServiceById(degreeId, req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const fetchServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await serviceService.getService(
      [
        'name',
        'incrementId'
      ]
    );
    res.send(setResponse(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId']))));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const getServiceByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await serviceService.getServiceByIdOrSlug(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('getServiceByIdOrSlugAction', e);
    next(e);
  }
};


const deleteServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await serviceService.deleteService(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('deleteServiceByIdAction', e);
    next(e);
  }
};

export default {
  createServiceAction,
  deleteServiceByIdAction,
  fetchServiceAction,
  getServiceByIdOrSlugAction,
  updateServiceAction,
}