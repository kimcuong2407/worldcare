import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productRouteAdministrationController from './productRouteAdministration.controller';

const productRouteAdministrationRoutes = (app: express.Application): void => {
  // Route Administration
  app.post('/api/v1/product-route-administration', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), productRouteAdministrationController.createProductRouteAdministrationAction);
  app.get('/api/v1/product-route-administration', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productRouteAdministrationController.fetchProductRouteAdministrationListAction);
  app.get('/api/v1/product-route-administration/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productRouteAdministrationController.fetchProductRouteAdministrationInfoAction);
  app.put('/api/v1/product-route-administration/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), productRouteAdministrationController.updateProductRouteAdministrationAction);
  app.delete('/api/v1/product-route-administration/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), productRouteAdministrationController.deleteProductRouteAdministrationByIdAction);
};

export default productRouteAdministrationRoutes;
