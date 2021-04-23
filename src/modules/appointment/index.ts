import middleware from '@app/core/middleware';
import express from 'express';
import serviceActions from './appointment.controller';

const categoryRoutes = (app: express.Application): void => {
  app.post('/api/v1/appointment', serviceActions.createServiceAction);
  app.get('/api/v1/appointment', serviceActions.fetchServiceAction);
  app.put('/api/v1/appointment/:id', serviceActions.updateServiceAction);
  app.get('/api/v1/appointment/:id', serviceActions.getServiceByIdAction);
};

export default categoryRoutes;
