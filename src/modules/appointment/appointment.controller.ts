import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import appointmentService from './appointment.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('degree.controller');

// DEGREE
const createServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await appointmentService.createAppointment(req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const updateServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await appointmentService.updateAppointmentById(degreeId, req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const fetchServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await appointmentService.getAppointment(
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


const getServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await appointmentService.getAppointmentById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('getServiceByIdAction', e);
    next(e);
  }
};


const deleteServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await appointmentService.deleteAppointment(degreeId);
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
  getServiceByIdAction,
  updateServiceAction,
}