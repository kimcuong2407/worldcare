import middleware from '@app/core/middleware';
import express from 'express';
import authActions from './auth.controller';

const authRoutes = (app: express.Application): void => {
  app.post('/api/v1/authenticate', authActions.loginAction);
  app.get('/api/v1/role', middleware.authenticate, authActions.fetchHospitalRolesAction);
  app.post('/api/v1/role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/assign-role', middleware.authenticate, authActions.createHospitalRolesAction);
  app.post('/api/v1/unassign-role', middleware.authenticate, authActions.createHospitalRolesAction);

};

export default authRoutes;
