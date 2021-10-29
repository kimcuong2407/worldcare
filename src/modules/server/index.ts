import express from 'express';
import serverActions from './server.controller';

const authRoutes = (app: express.Application): void => {
  app.use('/api/status', serverActions.serverStatusAction);
};

export default authRoutes;
