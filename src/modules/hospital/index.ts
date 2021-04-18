import middleware from '@app/core/middleware';
import express from 'express';
import hospitalActions from './hospital.controller';

const hospitalRoutes = (app: express.Application): void => {
  app.post('/api/v1/hospital', hospitalActions.createHospitalAction);
  app.get('/api/v1/hospital', hospitalActions.fetchHospitalAction);
  app.get('/api/v1/hospital/:hospitalId', hospitalActions.fetchHospitalInfoAction);
  app.put('/api/v1/hospital/:hospitalId', hospitalActions.updateHospitalInfoAction);
  app.delete('/api/v1/hospital/:hospitalId', hospitalActions.deleteHospitalAction);
};

export default hospitalRoutes;
