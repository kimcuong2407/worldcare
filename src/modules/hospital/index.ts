import middleware from '@app/core/middleware';
import express from 'express';
import hospitalActions from './hospital.controller';

const hospitalRoutes = (app: express.Application): void => {
  app.post('/api/v1/hospital', hospitalActions.createHospitalAction);
};

export default hospitalRoutes;
