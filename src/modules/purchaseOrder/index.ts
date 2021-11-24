import middleware from '@app/core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS, ROOT_RESOURCES} from '@app/core/permissions';
import express from 'express';
import purchaseOrderController from './purchase-order.controller';

const purchaseOrderRoutes = (app: express.Application): void => {
  app.post('/api/v1/purchase-order', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), purchaseOrderController.createPurchaseOrderAction);

  app.get('/api/v1/purchase-order', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), purchaseOrderController.fetchPurchaseOrderListByQueryAction);

  app.get('/api/v1/purchase-order/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), purchaseOrderController.fetchPurchaseOrderInfoByQueryAction);

  app.put('/api/v1/purchase-order/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), purchaseOrderController.updatePurchaseOrderAction);

  app.delete('/api/v1/purchase-order/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  ]),  purchaseOrderController.deletePurchaseOrderAction);

}