import middleware from '@app/core/middleware';
import express from 'express';
import authActions from './auth.controller';

const authRoutes = (app: express.Application): void => {
  app.post('/api/v1/authenticate', authActions.loginAction);
  app.post('/api/v1/staff-login', authActions.staffLoginAction);
  app.put('/api/v1/change-password', middleware.authenticate, authActions.changePasswordAction);
  app.post('/api/v1/register', authActions.registerAction);
  app.get('/api/v1/role', middleware.authenticate, authActions.fetchHospitalRolesAction);
  app.get('/api/v1/user-policy', middleware.authenticate, authActions.fetchPolicyAction);
  app.post('/api/v1/role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/assign-role', authActions.assignUserToGroupAction);
  app.put('/api/v1/user-group/:groupId/assign-permission', authActions.assignPermissionToRoleAction);
  app.put('/api/v1/user-group/:groupId/remove-permission', authActions.assignPermissionToRoleAction);
  app.post('/api/v1/authorization', authActions.authorizationAction);
  app.post('/api/v1/assign-role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/unassign-role', middleware.authenticate, authActions.createHospitalRolesAction);
};

export default authRoutes;
