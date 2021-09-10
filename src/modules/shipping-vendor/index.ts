import middleware from '@app/core/middleware';
import express from 'express';
import shippingVendorActions from './shipping-vendor.controller';

const shippingVendorRoutes = (app: express.Application): void => {
  // ShippingVendor
  app.post('/api/v1/shipping-vendor', middleware.authenticate, shippingVendorActions.createShippingVendorAction);
  app.get('/api/v1/shipping-vendor', shippingVendorActions.fetchShippingVendorAction);
  app.get('/api/v1/shipping-vendor/:id', shippingVendorActions.getShippingVendorByIdOrSlugAction);
  app.put('/api/v1/shipping-vendor/:id', middleware.authenticate, shippingVendorActions.updateShippingVendorAction);
  app.delete('/api/v1/shipping-vendor/:id', middleware.authenticate, shippingVendorActions.deleteShippingVendorByIdAction);
};

export default shippingVendorRoutes;
