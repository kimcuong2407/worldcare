import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import purchaseOrderActions from './sale.controller';

const saleRoutes = (app: express.Application): void => {
  app.post('/api/v1/sale', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), purchaseOrderActions.create);

  app.put('/api/v1/sale/:saleId', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), purchaseOrderActions.update);
};

export default saleRoutes;
