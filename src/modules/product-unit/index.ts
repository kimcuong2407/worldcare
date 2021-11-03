import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productUnitController from './productUnit.controller';

const productUnitRoutes = (app: express.Application): void => {
  // Product Unit
  app.post('/api/v1/product-unit', productUnitController.createProductUnitAction);
  app.get('/api/1/product-unit', productUnitController.fetchProductUnitAction);
  app.put('/api/v1/product-unit/:id', productUnitController.updateProductUnitAction);
  app.delete('/api/v1/product-unit/:id', productUnitController.deleteProductUnitByIdAction);
};

export default productUnitRoutes;
