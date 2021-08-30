import middleware from '@app/core/middleware';
import { ACTIONS, CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import userActions from './user.controller';

const userRoutes = (app: express.Application): void => {
  app.post('/api/v1/register', userActions.registerAction);

  app.get('/api/v1/user', middleware.authorization([
    [ CORE_RESOURCES.user,CORE_ACTIONS.read ],
    [ CORE_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), userActions.fetchUserAction);

  app.get('/api/v1/user/:userId', middleware.authorization([
    [ CORE_RESOURCES.user,CORE_ACTIONS.read ],
    [ CORE_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), userActions.getUserDetailAction);

  app.put('/api/v1/user/:userId', middleware.authorization([
    [ CORE_RESOURCES.user,CORE_ACTIONS.update ],
    [ CORE_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), userActions.updateUserAction);

  app.post('/api/v1/user', middleware.authorization([
    [ CORE_RESOURCES.user,CORE_ACTIONS.write ],
    [ CORE_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), userActions.createUserAction);

  app.delete('/api/v1/user/:userId', middleware.authorization([
    [ CORE_RESOURCES.user,CORE_ACTIONS.update ],
    [ CORE_RESOURCES.partner,CORE_ACTIONS.write ]
  ]), userActions.deleteUserAction);

  app.get('/api/v1/profile', middleware.authenticate, userActions.getProfileAction);
  app.get('/api/v1/me/address', middleware.authenticate, userActions.fetchAddressAction);
  app.post('/api/v1/me/address', middleware.authenticate, userActions.addNewAddressAction);
  app.put('/api/v1/me/address/:addressId', middleware.authenticate, userActions.updateAddressAction);
};

export default userRoutes;
