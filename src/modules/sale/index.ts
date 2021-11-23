import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseReceiptActions from './sale.controller';

const saleRoutes = (app: express.Application): void => {
  app.post('/api/v1/sale', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), purchaseReceiptActions.create);

  app.put('/api/v1/sale/:saleId', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), purchaseReceiptActions.update);
};

export default saleRoutes;
