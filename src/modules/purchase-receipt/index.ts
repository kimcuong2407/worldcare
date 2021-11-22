import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseReceiptActions from './purchaseReceipt.controller';

const purchaseReceiptRoutes = (app: express.Application): void => {
  app.post('/api/v1/purchase-receipt', middleware.authorization([
    [CLINIC_RESOURCES.purchaseReceipt, CORE_ACTIONS.write]
  ]), purchaseReceiptActions.create);

  app.put('/api/v1/purchase-receipt/:purchaseReceiptId', middleware.authorization([
    [CLINIC_RESOURCES.purchaseReceipt, CORE_ACTIONS.update]
  ]), purchaseReceiptActions.update);

  app.get('/api/v1/purchase-receipt', middleware.authorization([
    [CLINIC_RESOURCES.purchaseReceipt, CORE_ACTIONS.read]
  ]), purchaseReceiptActions.fetch);

  app.get('/api/v1/purchase-receipt/:purchaseReceiptId', middleware.authorization([
    [CLINIC_RESOURCES.purchaseReceipt, CORE_ACTIONS.read]
  ]), purchaseReceiptActions.getById);
};

export default purchaseReceiptRoutes;
