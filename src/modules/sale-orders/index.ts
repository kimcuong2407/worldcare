import middleware from '@app/core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS, ROOT_RESOURCES} from '@app/core/permissions';
import express from 'express';
import saleOrderController from './sale-order.controller';

const saleOrderRoutes = (app: express.Application): void => {
  // app.post('/api/v1/sale-order', middleware.authorization([
  //   [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  // ]), saleOrderController.createSaleOrderAction);

  app.get('/api/v1/sale-order', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), saleOrderController.fetchSaleOrderListByQueryAction);

  app.get('/api/v1/sale-order/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), saleOrderController.fetchSaleOrderInfoByQueryAction);

  // app.put('/api/v1/sale-order/:id', middleware.authorization([
  //   [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  // ]), saleOrderController.updateSaleOrderAction);

  // app.delete('/api/v1/sale-order/:id', middleware.authorization([
  //   [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  // ]),  saleOrderController.deleteSaleOrderAction);

}

export default saleOrderRoutes;