import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productPositionController from './productPosition.controller';

const productPositionRoutes = (app: express.Application): void => {
  // Product Position
  app.post('/api/v1/product-position', productPositionController.createProductPositionAction);
  app.get('/api/v1/product-position', productPositionController.fetchProductPositionListAction);
  app.get('/api/v1/product-position/:id', productPositionController.fetchProductPositionInfoAction);
  app.put('/api/v1/product-position/:id', productPositionController.updateProductPositionAction);
  app.delete('/api/v1/product-position/:id', productPositionController.deleteProductPositionByIdAction);
};

export default productPositionRoutes;
