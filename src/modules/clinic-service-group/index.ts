import express from 'express';
import serviceGroupActions from './clinicServiceGroup.controller';
import middleware from '@core/middleware';
import {CORE_ACTIONS, CLINIC_RESOURCES} from '@core/permissions';

const serviceGroupRoutes = (app: express.Application): void => {
  app.post('/api/v1/clinic-service-group', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.write]
  ]), serviceGroupActions.createServiceGroupAction);

  app.get('/api/v1/clinic-service-group', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.read]
  ]), serviceGroupActions.fetchServiceGroupsAction);

  app.delete('/api/v1/clinic-service-group/:serviceGroupId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.delete]
  ]), serviceGroupActions.deleteServiceGroupAction);

  app.get('/api/v1/clinic-service-group/:serviceGroupId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.read]
  ]), serviceGroupActions.getServiceGroupByCodeAction);

  app.put('/api/v1/clinic-service-group/:serviceGroupId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.update]
  ]), serviceGroupActions.updateServiceGroupInfoAction);
};

export default serviceGroupRoutes;
