import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import policyActions from './policy.controller';

const policyRoutes = (app: express.Application): void => {
  // Policy
  app.post('/api/v1/policy', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), policyActions.createPolicyAction);
  app.get('/api/v1/policy', policyActions.fetchPolicyAction);
  app.get('/api/v1/policy/:id', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), policyActions.getPolicyByIdOrSlugAction);
  app.put('/api/v1/policy/:id', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), middleware.authenticate, policyActions.updatePolicyAction);
  app.delete('/api/v1/policy/:id', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), middleware.authenticate, policyActions.deletePolicyByIdAction);
};

export default policyRoutes;
