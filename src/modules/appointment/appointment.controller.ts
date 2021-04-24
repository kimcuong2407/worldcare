import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import appointmentService from './appointment.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('appointment.controller');

// DEGREE
const createServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);

    res.send(appointment);
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const updateServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    const appointment = await appointmentService.updateAppointmentById(appointmentId, req.body);

    res.send(appointment);
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const fetchServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointments = await appointmentService.getAppointment(
      [
        'name',
        'incrementId'
      ]
    );
    res.send(map(appointments, (appointment) => pick(appointment, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createServiceAction', e);
    next(e);
  }
};


const getServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    
    const appointment = await appointmentService.getAppointmentById(appointmentId);
    res.send(appointment);
  } catch (e) {
    logger.error('getServiceByIdAction', e);
    next(e);
  }
};


const deleteServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    
    const appointment = await appointmentService.deleteAppointment(appointmentId);
    res.send(appointment);
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