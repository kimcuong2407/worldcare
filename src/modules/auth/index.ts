import express from 'express';
import authActions from './auth.controller';

const authRoutes = (app: express.Application): void => {
  app.post('/api/auth/login', authActions.loginAction);
};

export default authRoutes;
