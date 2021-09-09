import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import branchActions from './branch.controller';

const branchRoutes = (app: express.Application): void => {
  app.post('/api/v1/branch', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), branchActions.createBranchAction);
  
  app.put('/api/v1/branch/:branchId', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), branchActions.updateBranchInfoAction);

  app.get('/api/v1/:branchType(pharmacy|clinic)', branchActions.getBranchByCategoryAction);

  app.get('/api/v1/branch/:branchId', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), branchActions.fetchBranchInfoAction);

  app.delete('/api/v1/branch/:branchId', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), branchActions.deleteBranchAction);

  app.get('/api/v1/branch', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write],
    [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  ]), branchActions.fetchBranchAction);

  app.post('/api/v1/branch/:branchId/employee', middleware.authorization(
    [
      [CORE_RESOURCES.branch, CORE_ACTIONS.write],
      [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
    ]
  ), branchActions.createBranchUserAction);
  
  // app.get('/api/v1/employee', middleware.authorization([
  //   [CORE_RESOURCES.branch, CORE_ACTIONS.write],
  //   [ROOT_RESOURCES.partner, CORE_ACTIONS.write]
  // ]), branchActions.getBranchUserAction);

  app.get('/api/v1/branch/:branchId/group', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write]
  ]), branchActions.getBranchGroupAction);

  app.get('/api/v1/branch/:branchId/group/:groupId', middleware.authorization([
    [CORE_RESOURCES.branch, CORE_ACTIONS.write]
  ]), branchActions.getBranchGroupDetailAction);




};

export default branchRoutes;
