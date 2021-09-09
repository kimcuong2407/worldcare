import middleware from '@app/core/middleware';
import express from 'express';
import policyActions from './policy.controller';

const policyRoutes = (app: express.Application): void => {
  // Policy
  app.post('/api/v1/policy', middleware.authenticate, policyActions.createPolicyAction);
  app.get('/api/v1/policy', policyActions.fetchPolicyAction);
  app.get('/api/v1/policy/:id', policyActions.getPolicyByIdOrSlugAction);
  app.put('/api/v1/policy/:id', middleware.authenticate, policyActions.updatePolicyAction);
  app.delete('/api/v1/policy/:id', middleware.authenticate, policyActions.deletePolicyByIdAction);
};

export default policyRoutes;
