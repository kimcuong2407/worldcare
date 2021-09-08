import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import partnerActions from './partner.controller';

const partnerRoutes = (app: express.Application): void => {
  app.post('/api/v1/partner', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.createPartnerAction);

  
  app.get('/api/v1/partner/:partnerId/employee', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.getPartnerUserAction);

  app.get('/api/v1/partner/:partnerId/group', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.getPartnerGroupAction);

  app.get('/api/v1/partner/:partnerId/group/:groupId', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.getPartnerGroupDetailAction);

  app.get('/api/v1/partner', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.fetchPartnerAction);

  app.get('/api/v1/partner/:partnerId', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.fetchPartnerInfoAction);

  app.get('/api/v1/partner/:partnerId/branch', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.fetchPartnerBranchAction);

  app.put('/api/v1/partner/:partnerId', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.updatePartnerInfoAction);

  app.delete('/api/v1/partner/:partnerId', middleware.authorization([
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), partnerActions.deletePartnerAction);
};

export default partnerRoutes;
