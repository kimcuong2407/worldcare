import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productActions from './product.controller';

const productRoutes = (app: express.Application): void => {
  app.post('/api/v1/product', productActions.createProductAction);
  // app.get('/api/1/product', productActions.);
  // app.put('/api/v1/product/:id', productActions.);
  // app.delete('/api/v1/product/:id', productActions.);
};

export default productRoutes;
