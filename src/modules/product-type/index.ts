import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productTypeController from './productType.controller';

const productTypeRoutes = (app: express.Application): void => {
  // Product Unit
  app.post('/api/v1/product-unit', productTypeController.createProductTypeAction);
  app.get('/api/1/product-unit', productTypeController.fetchProductTypeAction);
  app.put('/api/v1/product-unit/:id', productTypeController.updateProductTypeAction);
  app.delete('/api/v1/product-unit/:id', productTypeController.deleteProductTypeByIdAction);
};

export default productTypeRoutes;
