import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productUnitController from './productUnit.controller';

const productUnitRoutes = (app: express.Application): void => {
  // Product Unit
  app.post('/api/v1/product-unit', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), productUnitController.createProductUnitAction);
  app.get('/api/v1/product-unit', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productUnitController.fetchProductUnitListAction);
  app.get('/api/v1/product-unit/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.read]]), productUnitController.fetchProductUnitInfoAction);
  app.put('/api/v1/product-unit/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.update]]), productUnitController.updateProductUnitAction);
  app.delete('/api/v1/product-unit/:id', middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.delete]]), productUnitController.deleteProductUnitByIdAction);
};

export default productUnitRoutes;
