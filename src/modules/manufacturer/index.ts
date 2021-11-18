import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import manufacturerController from './manufacturer.controller';

const manufacturerRoutes = (app: express.Application): void => {
  // Manufacturer
  app.post('/api/v1/manufacturer', manufacturerController.createManufacturerAction);
  app.get('/api/v1/manufacturer', manufacturerController.fetchManufacturerListAction);
  app.get('/api/v1/manufacturer/:id', manufacturerController.fetchManufacturerInfoAction);
  app.put('/api/v1/manufacturer/:id', manufacturerController.updateManufacturerAction);
  app.delete('/api/v1/manufacturer/:id', manufacturerController.deleteManufacturerByIdAction);
};

export default manufacturerRoutes;
