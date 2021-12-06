import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseOrderActions from './purchaseOrder.controller';

const purchaseOrderRoutes = (app: express.Application): void => {
  app.post('/api/v1/purchase-order', middleware.authorization([
    [CLINIC_RESOURCES.purchaseOrder, CORE_ACTIONS.write]
  ]), purchaseOrderActions.create);

  app.put('/api/v1/purchase-order/:purchaseOrderId', middleware.authorization([
    [CLINIC_RESOURCES.purchaseOrder, CORE_ACTIONS.update]
  ]), purchaseOrderActions.update);

  app.get('/api/v1/purchase-order', middleware.authorization([
    [CLINIC_RESOURCES.purchaseOrder, CORE_ACTIONS.read]
  ]), purchaseOrderActions.fetch);

  app.get('/api/v1/purchase-order/:purchaseOrderId', middleware.authorization([
    [CLINIC_RESOURCES.purchaseOrder, CORE_ACTIONS.read]
  ]), purchaseOrderActions.getById);
};

export default purchaseOrderRoutes;
