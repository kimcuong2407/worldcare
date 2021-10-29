import middleware from '@app/core/middleware';
import { ACTIONS, CORE_ACTIONS, CORE_RESOURCES, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import customerActions from './customer-account.controller';

const customerAccountRoutes = (app: express.Application): void => {
    app.post('/api/v1/register', customerActions.registerAction);

  app.get('/api/v1/customer-account', middleware.authorization([
    [ CORE_RESOURCES.customer,CORE_ACTIONS.read ],
    [ ROOT_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), customerActions.fetchCustomerAccountAction);

  app.get('/api/v1/customer-account/:customerId', middleware.authorization([
    [ CORE_RESOURCES.customer,CORE_ACTIONS.read ],
    [ ROOT_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), customerActions.getCustomerDetailAction);

  // app.put('/api/v1/customer-account/:customerId', middleware.authorization([
  //   [ CORE_RESOURCES.customer,CORE_ACTIONS.update ],
  //   [ ROOT_RESOURCES.partner,CORE_ACTIONS.write ]
  // ]), customerActions.updateCustomerAction);

  // app.post('/api/v1/customer-account', middleware.authorization([
  //   [ CORE_RESOURCES.customer,CORE_ACTIONS.write ],
  //   [ ROOT_RESOURCES.partner,CORE_ACTIONS.write ]
  // ]), customerActions.createCustomerAction);

  // app.delete('/api/v1/customer-account/:customerId', middleware.authorization([
  //   [ CORE_RESOURCES.customer,CORE_ACTIONS.update ],
  //   [ ROOT_RESOURCES.partner,CORE_ACTIONS.write ]
  // ]), customerActions.deleteCustomerAction);

  app.get('/api/v1/profile', middleware.authenticate, customerActions.getProfileAction);
  app.put('/api/v1/profile', middleware.authenticate, customerActions.updateCustomerProfileAction);
  app.get('/api/v1/me/address', middleware.authenticate, customerActions.fetchAddressAction);
  app.post('/api/v1/me/address', middleware.authenticate, customerActions.addNewAddressAction);
  app.put('/api/v1/me/address/:addressId', middleware.authenticate, customerActions.updateAddressAction);
};

export default customerAccountRoutes;
