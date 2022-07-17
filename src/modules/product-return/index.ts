import middleware from '@app/core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS, ROOT_RESOURCES} from '@app/core/permissions';
import express from 'express';
import productReturnController from './productReturn.controller';

const productReturnRoutes = (app: express.Application): void => {

  app.post('/api/v1/return', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), productReturnController.createProductReturnAction);

  app.post('/api/v1/exchange', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), productReturnController.createProductExchangeAction);

  app.delete('/api/v1/return/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), productReturnController.deleteProductReturnAction);

  app.get('/api/v1/return', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), productReturnController.fetchProductReturnListByQueryAction);

  app.patch('/api/v1/return', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), productReturnController.updateProductReturnAction);
}

export default productReturnRoutes;