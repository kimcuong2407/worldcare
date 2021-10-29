import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import partnershipActions from './partnership.controller';

const partnershipRoutes = (app: express.Application): void => {
  app.post('/api/v1/partnership', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.write],
  ]), partnershipActions.createPartnershipAction);

  app.get('/api/v1/partnership', partnershipActions.fetchPartnershipAction);

  app.get('/api/v1/partnership/:partnershipId', partnershipActions.getPartnershipDetailAction);

  app.put('/api/v1/partnership/:partnershipId', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.update],
  ]), partnershipActions.updatePartnershipAction);

  app.delete('/api/v1/partnership/:partnershipId', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.delete],
  ]), partnershipActions.deletePartnershipAction);
};

export default partnershipRoutes;
