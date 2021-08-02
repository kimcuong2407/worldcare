import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import hospitalActions from './hospital.controller';

const hospitalRoutes = (app: express.Application): void => {
  app.post('/api/v1/hospital', middleware.authorization(CORE_RESOURCES.company, CORE_ACTIONS.write), hospitalActions.createHospitalAction);
  app.get('/api/v1/hospital', hospitalActions.fetchHospitalAction);
  app.get('/api/v1/hospital/:hospitalId/simillar-hospital', hospitalActions.getSimillarHospitalInfoAction);
  app.get('/api/v1/hospital/:hospitalId/available-slot', hospitalActions.getAvailableHospitalSlotAction);
  app.get('/api/v1/hospital/:hospitalId', hospitalActions.fetchHospitalInfoAction);
  app.put('/api/v1/hospital/:hospitalId', middleware.authorization(CORE_RESOURCES.company, CORE_ACTIONS.update), hospitalActions.updateHospitalInfoAction);
  app.delete('/api/v1/hospital/:hospitalId', middleware.authorization(CORE_RESOURCES.company, CORE_ACTIONS.delete), hospitalActions.deleteHospitalAction);
};

export default hospitalRoutes;
