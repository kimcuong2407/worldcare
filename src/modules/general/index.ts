import middleware from '@app/core/middleware';
import express from 'express';
import generalActions from './general.controller';
import contactActions from './contact.controller';

const generalRoutes = (app: express.Application): void => {
  app.post('/api/v1/contact', contactActions.createContactAction);
  // app.get('/api/v1/contact', middleware.authenticate, generalActions.fetchAppointmentAction);
  // app.put('/api/v1/contact/:id', middleware.authenticate, generalActions.updateAppointmentAction);
  // app.get('/api/v1/contact/:id', middleware.authenticate, generalActions.getAppointmentByIdAction);
  app.get('/api/v1/homepage', generalActions.fetchHomepageContentAction);
};

export default generalRoutes;
