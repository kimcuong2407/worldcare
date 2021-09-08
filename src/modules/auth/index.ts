import { ACTIONS, CORE_ACTIONS, CORE_RESOURCES } from './../../core/permissions/index';
import middleware from '@app/core/middleware';
import express from 'express';
import authActions from './auth.controller';

const authRoutes = (app: express.Application): void => {
  app.post('/api/v1/authenticate', authActions.loginAction);
  app.post('/api/v1/staff-login', authActions.staffLoginAction);
  app.put('/api/v1/change-password', middleware.authenticate, authActions.changePasswordAction);
  app.get('/api/v1/role', middleware.authenticate, authActions.fetchHospitalRolesAction);
  app.get('/api/v1/resource-permission', 
  middleware.authorization([
    [CORE_RESOURCES.userGroup, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
  ]),
  authActions.getResourcePermissionAction);
  app.get('/api/v1/user-policy', middleware.authenticate, authActions.fetchPolicyAction);
  // app.post('/api/v1/role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/assign-role', authActions.assignUserToGroupAction);

  app.put('/api/v1/user-group/:groupId/permission', authActions.assignPermissionToRoleAction);
  app.delete('/api/v1/user-group/:groupId/permission', authActions.removePermissionToRoleAction);

  app.get('/api/v1/user-group',
  middleware.authorization([
    [CORE_RESOURCES.userGroup, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
  ]),
  authActions.fetchUserGroupAction);

  app.post('/api/v1/user-group',
    middleware.authorization([
      [CORE_RESOURCES.userGroup, CORE_ACTIONS.write],
      [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
    ]),
    authActions.createUserGroupAction);

  app.put('/api/v1/user-group/:groupId',
    middleware.authorization([
      [CORE_RESOURCES.userGroup, CORE_ACTIONS.update],
      [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
    ]),
    authActions.updateUserGroupAction);

  app.delete('/api/v1/user-group/:groupId',
    middleware.authorization([
      [CORE_RESOURCES.userGroup, CORE_ACTIONS.delete],
      [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
    ]),
    authActions.deleteUserGroupAction);

  app.get('/api/v1/user-group/:groupId',
    middleware.authorization([
      [CORE_RESOURCES.userGroup, CORE_ACTIONS.read],
      [ROOT_RESOURCES.partner, CORE_ACTIONS.write],
    ]),
    authActions.getUserGroupDetailAction);
    
  app.post('/api/v1/authorization', authActions.authorizationAction);
  app.post('/api/v1/assign-role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/unassign-role', middleware.authenticate, authActions.createHospitalRolesAction);
};

export default authRoutes;
