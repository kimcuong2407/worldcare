import middleware from '@app/core/middleware';
import express from 'express';
import userActions from './user.controller';

const userRoutes = (app: express.Application): void => {
  app.get('/api/v1/profile', middleware.authenticate, userActions.getProfileAction);
  app.get('/api/v1/me/address', middleware.authenticate, userActions.fetchAddressAction);
  app.post('/api/v1/me/address', middleware.authenticate, userActions.addNewAddressAction);
  app.put('/api/v1/me/address/:addressId', middleware.authenticate, userActions.updateAddressAction);
};

export default userRoutes;
