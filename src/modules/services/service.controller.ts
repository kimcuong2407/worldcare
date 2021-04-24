import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import serviceService from './service.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('service.controller');

// DEGREE
const createServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const service = await serviceService.createService(req.body);

    res.send(service);
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const updateServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceId = get(req.params, 'id');
    const service = await serviceService.updateServiceById(serviceId, req.body);

    res.send(service);
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const fetchServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const services = await serviceService.getService();
    res.send(services);
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const getServiceByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceId = get(req.params, 'id');
    
    const service = await serviceService.getServiceByIdOrSlug(serviceId);
    res.send(service);
  } catch (e) {
    logger.error('getServiceByIdOrSlugAction', e);
    next(e);
  }
};


const deleteServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceId = get(req.params, 'id');
    
    const service = await serviceService.deleteService(serviceId);
    res.send(service);
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