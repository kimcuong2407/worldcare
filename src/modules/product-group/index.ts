import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productGroupController from './productGroup.controller';

const productGroupRoutes = (app: express.Application): void => {
  // Product Group
  app.post('/api/v1/product-group', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), productGroupController.createProductGroupAction);
  app.get('/api/v1/product-group', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productGroupController.fetchProductGroupListAction);
  app.get('/api/v1/product-group/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productGroupController.fetchProductGroupInfoAction);
  app.put('/api/v1/product-group/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), productGroupController.updateProductGroupAction);
  app.delete('/api/v1/product-group/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), productGroupController.deleteProductGroupByIdAction);
};

export default productGroupRoutes;
