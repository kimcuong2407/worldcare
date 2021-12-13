import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productTypeController from './productType.controller';

const productTypeRoutes = (app: express.Application): void => {
  // Product type
  app.post('/api/v1/product-type', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), productTypeController.createProductTypeAction);
  app.get('/api/v1/product-type', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productTypeController.fetchProductTypeListAction);
  app.get('/api/v1/product-type/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productTypeController.fetchProductTypeInfoAction);
  app.put('/api/v1/product-type/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), productTypeController.updateProductTypeAction);
  app.delete('/api/v1/product-type/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), productTypeController.deleteProductTypeByIdAction);
};

export default productTypeRoutes;
