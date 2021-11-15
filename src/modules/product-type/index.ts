import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productTypeController from './productType.controller';

const productTypeRoutes = (app: express.Application): void => {
  // Product type
  app.post('/api/v1/product-type', productTypeController.createProductTypeAction);
  app.get('/api/v1/product-type', productTypeController.fetchProductTypeAction);
  app.put('/api/v1/product-type/:id', productTypeController.updateProductTypeAction);
  app.delete('/api/v1/product-type/:id', productTypeController.deleteProductTypeByIdAction);
};

export default productTypeRoutes;
