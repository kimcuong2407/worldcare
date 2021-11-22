import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseOrderController from './purchase-order.controller';

const purchaseOrderRoutes = (app:express.Application): void => {
  app.post('/api/v1/purchase-order', purchaseOrderController.createPurchaseOrderAction);
  app.get('/api/v1/purchase-order', purchaseOrderController.fetchPurchaseOrderListByQueryAction);
  app.get('/api/v1/purchase-order/:id', purchaseOrderController.fetchPurchaseOrderInfoByQueryAction);
  app.put('/api/v1/purchase-order/:id', purchaseOrderController.updatePurchaseOrderAction);
  app.delete('/api/v1/purchase-order/:id', purchaseOrderController.deletePurchaseOrderAction);
}