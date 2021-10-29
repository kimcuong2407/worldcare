import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import shippingVendorActions from './shipping-vendor.controller';

const shippingVendorRoutes = (app: express.Application): void => {
  // ShippingVendor
  app.post('/api/v1/shipping-vendor', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), shippingVendorActions.createShippingVendorAction);
  app.get('/api/v1/shipping-vendor', middleware.authenticate, shippingVendorActions.fetchShippingVendorAction);
  app.get('/api/v1/shipping-vendor/:id',  middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]),shippingVendorActions.getShippingVendorByIdOrSlugAction);
  app.put('/api/v1/shipping-vendor/:id', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), shippingVendorActions.updateShippingVendorAction);
  app.delete('/api/v1/shipping-vendor/:id', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), shippingVendorActions.deleteShippingVendorByIdAction);
};

export default shippingVendorRoutes;
