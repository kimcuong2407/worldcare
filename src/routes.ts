import express from 'express';
import serverRoutes from '@modules/server';

export default (app: express.Application): void => {
  serverRoutes(app);
};
