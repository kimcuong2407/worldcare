import middleware from '@app/core/middleware';
import express from 'express';
import serviceActions from './appointment.controller';

const appointmentRoutes = (app: express.Application): void => {
  app.post('/api/v1/appointment', serviceActions.createAppointmentAction);
  app.get('/api/v1/appointment', middleware.authenticate, serviceActions.fetchAppointmentAction);
  app.put('/api/v1/appointment/:id', middleware.authenticate, serviceActions.updateAppointmentAction);
  app.get('/api/v1/appointment/:id', middleware.authenticate, serviceActions.getAppointmentByIdAction);
};

export default appointmentRoutes;
