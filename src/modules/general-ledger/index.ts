import express from 'express';
import generalLedgerActions from './generalLedger.controller';
import middleware from '@core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS} from '@core/permissions';

const batchRoutes = (app: express.Application): void => {

  app.get('/api/v1/general-ledger', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), generalLedgerActions.fetchGeneralLedgerAction);
  
};

export default batchRoutes;
