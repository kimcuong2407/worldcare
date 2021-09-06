import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import customerActions from './customer.controller';

const customerRoutes = (app: express.Application): void => {
  app.post('/api/v1/customer', middleware.authorization([
    [CORE_RESOURCES.customer, CORE_ACTIONS.write],
  ]), customerActions.createCustomerAction);

  app.get('/api/v1/customer', middleware.authorization([
    [CORE_RESOURCES.customer, CORE_ACTIONS.read],
  ]), customerActions.fetchCustomerAction);

  app.get('/api/v1/customer/:customerId', middleware.authorization([
    [CORE_RESOURCES.customer, CORE_ACTIONS.read],
  ]), customerActions.getCustomerDetailAction);

  app.put('/api/v1/customer/:customerId', middleware.authorization([
    [CORE_RESOURCES.customer, CORE_ACTIONS.update],
  ]), customerActions.updateCustomerAction);

  app.delete('/api/v1/customer/:customerId', middleware.authorization([
    [CORE_RESOURCES.customer, CORE_ACTIONS.delete],
  ]), customerActions.deleteCustomerAction);
};

export default customerRoutes;
