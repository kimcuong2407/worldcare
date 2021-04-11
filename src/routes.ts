import express from 'express';
import serverRoutes from '@modules/server';
import authRoutes from '@modules/auth';

export default (app: express.Application): void => {
  serverRoutes(app);
  authRoutes(app);
};
