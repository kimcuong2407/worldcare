import express from 'express';
import customerAction from './customerV2.controller';
import middleware from '@core/middleware';
import {CORE_ACTIONS, ROOT_RESOURCES} from '@core/permissions';

const supplierRoutes = (app: express.Application): void => {
  app.post('/api/v2/customer', middleware.authorization([
    [ROOT_RESOURCES.customer, CORE_ACTIONS.write]
  ]), customerAction.createCustomerAction);
  app.get('/api/v2/customer', middleware.authorization([
    [ROOT_RESOURCES.customer, CORE_ACTIONS.read]
  ]), customerAction.fetchCustomersAction);
  app.get('/api/v2/customer/:customerId', middleware.authorization([
    [ROOT_RESOURCES.customer, CORE_ACTIONS.read]
  ]), customerAction.getCustomerByIdAction);
  app.put('/api/v2/customer/:customerId', middleware.authorization([
    [ROOT_RESOURCES.customer, CORE_ACTIONS.update]
  ]), customerAction.updateCustomerInfoAction);
  app.delete('/api/v2/customer/:customerId', middleware.authorization([
    [ROOT_RESOURCES.customer, CORE_ACTIONS.delete]
  ]), customerAction.deleteCustomerAction);
};

export default supplierRoutes;
