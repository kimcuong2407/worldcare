import express from 'express';
import batchActions from './batch.controller';
import middleware from '@core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS} from '@core/permissions';

const batchRoutes = (app: express.Application): void => {

  app.post('/api/v1/batch',
  // middleware.authorization([
  //   [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  // ]),
  batchActions.createBatchAction);

  app.get('/api/v1/batch', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), batchActions.fetchBatchesAction);
};

export default batchRoutes;
