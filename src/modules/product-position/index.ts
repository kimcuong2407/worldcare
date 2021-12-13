import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productPositionController from './productPosition.controller';

const productPositionRoutes = (app: express.Application): void => {
  // Product Position
  app.post('/api/v1/product-position', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), productPositionController.createProductPositionAction);
  app.get('/api/v1/product-position', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productPositionController.fetchProductPositionListAction);
  app.get('/api/v1/product-position/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productPositionController.fetchProductPositionInfoAction);
  app.put('/api/v1/product-position/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), productPositionController.updateProductPositionAction);
  app.delete('/api/v1/product-position/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), productPositionController.deleteProductPositionByIdAction);
};

export default productPositionRoutes;
