import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import manufacturerController from './manufacturer.controller';

const manufacturerRoutes = (app: express.Application): void => {
  // Manufacturer
  app.post('/api/v1/manufacturer', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), manufacturerController.createManufacturerAction);
  app.get('/api/v1/manufacturer', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), manufacturerController.fetchManufacturerListAction);
  app.get('/api/v1/manufacturer/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), manufacturerController.fetchManufacturerInfoAction);
  app.put('/api/v1/manufacturer/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), manufacturerController.updateManufacturerAction);
  app.delete('/api/v1/manufacturer/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), manufacturerController.deleteManufacturerByIdAction);
};

export default manufacturerRoutes;
