import express from 'express';
import serverRoutes from '@modules/server';
import authRoutes from '@modules/auth';
import userRoutes from '@modules/user';
import degreeRoutes from './modules/degree';

export default (app: express.Application): void => {
  serverRoutes(app);
  authRoutes(app);
  userRoutes(app);
  degreeRoutes(app);
};
