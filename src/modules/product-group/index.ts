import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productGroupController from './productGroup.controller';

const productGroupRoutes = (app: express.Application): void => {
  // Product Group
  app.post('/api/v1/product-group', productGroupController.createProductGroupAction);
  app.get('/api/v1/product-group', productGroupController.fetchProductGroupAction);
  app.put('/api/v1/product-group/:id', productGroupController.updateProductGroupAction);
  app.delete('/api/v1/product-group/:id', productGroupController.deleteProductGroupByIdAction);
};

export default productGroupRoutes;
