import middleware from '@app/core/middleware';
import express from 'express';
import userActions from './user.controller';

const userRoutes = (app: express.Application): void => {
  app.get('/api/v1/profile', middleware.authenticate, userActions.getProfileAction);
};

export default userRoutes;
