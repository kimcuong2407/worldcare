import express from 'express';
import serverRoutes from '@modules/server';
import authRoutes from '@modules/auth';
import userRoutes from '@modules/user';
import configurationRoutes from './modules/configuration';
import fileRoutes from './modules/file';
import hospitalRoutes from './modules/hospital';

export default (app: express.Application): void => {
  serverRoutes(app);
  authRoutes(app);
  userRoutes(app);
  hospitalRoutes(app);
  configurationRoutes(app);
  fileRoutes(app);
};
