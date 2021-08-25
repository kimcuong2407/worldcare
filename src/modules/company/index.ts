import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import companyActions from './company.controller';

const companyRoutes = (app: express.Application): void => {
  app.post('/api/v1/company', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.createCompanyAction);

  app.get('/api/v1/:companyType(pharmacy|hospital)', companyActions.getCompanyByCategoryAction);
  app.post('/api/v1/company/:companyId/employee', middleware.authorization(
    [
      [CORE_RESOURCES.company, CORE_ACTIONS.write]
    ]
  ), companyActions.createCompanyUserAction);
  
  app.get('/api/v1/company/:companyId/employee', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.getCompanyUserAction);

  app.get('/api/v1/company/:companyId/group', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.getCompanyGroupAction);
  app.get('/api/v1/company/:companyId/group/:groupId', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.getCompanyGroupDetailAction);
  app.get('/api/v1/company', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.fetchCompanyAction);
  app.get('/api/v1/company/:companyId', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.fetchCompanyInfoAction);
  app.put('/api/v1/company/:companyId', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.updateCompanyInfoAction);
  app.delete('/api/v1/company/:companyId', middleware.authorization([
    [CORE_RESOURCES.company, CORE_ACTIONS.write]
  ]), companyActions.deleteCompanyAction);
};

export default companyRoutes;
