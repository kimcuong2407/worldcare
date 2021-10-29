import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import appointmentAppointment from './appointment.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('appointment.controller');

// DEGREE
const createAppointmentAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { customer, time, serviceId, hospitalId, message, source, specialityId } = req.body;
    
    const appointment = await appointmentAppointment.createAppointment({
      customer, time, serviceId, hospitalId, message, source, specialityId,
    });

    res.send(appointment);
  } catch (e) {
    logger.error('createAppointmentAction', e);
    next(e);
  }
};


// DEGREE
const createAppointmentForBranchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const hospitalId = req.companyId;
    const { customer, time, serviceId, message, source, specialityId } = req.body;
    const appointment = await appointmentAppointment.createAppointment({
      customer, time, serviceId, hospitalId, message, source, specialityId,
    });

    res.send(appointment);
  } catch (e) {
    logger.error('createAppointmentForBranchAction', e);
    next(e);
  }
};

const updateAppointmentAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    const appointment = await appointmentAppointment.updateAppointmentById(appointmentId, req.body);

    res.send(appointment);
  } catch (e) {
    logger.error('createAppointmentAction', e);
    next(e);
  }
};


const fetchAppointmentAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startTime, endTime, serviceId,specialityId, hospitalId, status, source } = req.query;
    const appointments = await appointmentAppointment.fetchAppointmentV2({
      startTime, endTime, serviceId, specialityId, hospitalId, status, source
    }, {});
    res.send(appointments);
  } catch (e) {
    logger.error('createAppointmentAction', e);
    next(e);
  }
};


const getAppointmentByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    const raw = get(req.query, 'raw');

    const appointment = await appointmentAppointment.getAppointmentById(appointmentId, raw);
    res.send(appointment);
  } catch (e) {
    logger.error('getAppointmentByIdAction', e);
    next(e);
  }
};


const deleteAppointmentByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const appointmentId = get(req.params, 'id');
    
    const appointment = await appointmentAppointment.deleteAppointment(appointmentId);
    res.send(appointment);
  } catch (e) {
    logger.error('deleteAppointmentByIdAction', e);
    next(e);
  }
};

export default {
  createAppointmentAction,
  deleteAppointmentByIdAction,
  fetchAppointmentAction,
  getAppointmentByIdAction,
  updateAppointmentAction,
  createAppointmentForBranchAction,
}