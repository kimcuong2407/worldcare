import middleware from '@app/core/middleware';
import express from 'express';
import serviceActions from './service.controller';

const serviceRoutes = (app: express.Application): void => {
  app.post('/api/v1/service', serviceActions.createServiceAction);
  app.get('/api/v1/service', serviceActions.getServiceByIdOrSlugAction);
  app.put('/api/v1/service/:id', serviceActions.updateServiceAction);
  app.get('/api/v1/service/:id', serviceActions.getServiceByIdOrSlugAction);
};

export default serviceRoutes;
