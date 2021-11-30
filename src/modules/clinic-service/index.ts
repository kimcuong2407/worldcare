import express from 'express';
import clinicServiceActions from './clinicService.controller';
import middleware from '@core/middleware';
import {CORE_ACTIONS, CLINIC_RESOURCES} from '@core/permissions';

const serviceGroupRoutes = (app: express.Application): void => {
  app.post('/api/v1/clinic-service', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.write]
  ]), clinicServiceActions.create);

  app.get('/api/v1/clinic-service', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.read]
  ]), clinicServiceActions.fetchClinicServicesAction);
  
  app.delete('/api/v1/clinic-service/:clinicServiceId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.delete]
  ]), clinicServiceActions.delete);

  app.get('/api/v1/clinic-service/:clinicServiceId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.read]
  ]), clinicServiceActions.getServiceByIdAction);

  app.put('/api/v1/clinic-service/:serviceGroupId', middleware.authorization([
    [CLINIC_RESOURCES.clinicService, CORE_ACTIONS.update]
  ]), clinicServiceActions.updateClinicServiceAction);
};

export default serviceGroupRoutes;
