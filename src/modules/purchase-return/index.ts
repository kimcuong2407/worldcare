import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseReturnActions from './purchaseReturn.controller';

const purchaseReturnRoutes = (app: express.Application): void => {
  app.post('/api/v1/purchase-return', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), purchaseReturnActions.create);

  app.put('/api/v1/purchase-return/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), purchaseReturnActions.update);

  app.get('/api/v1/purchase-return', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), purchaseReturnActions.fetch);

  app.get('/api/v1/purchase-return/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), purchaseReturnActions.getById);

  app.delete('/api/v1/purchase-return/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  ]), purchaseReturnActions.cancelAction);

};

export default purchaseReturnRoutes;
