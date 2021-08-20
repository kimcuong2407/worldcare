import middleware from '@app/core/middleware';
import express from 'express';
import employeeActions from './employee.controller';

const staffRoutes = (app: express.Application): void => {
  app.post('/api/v1/staff', middleware.authenticate, employeeActions.createStaffAction);
  app.get('/api/v1/staff', employeeActions.fetchStaffAction);
  app.get('/api/v1/staff/:staffId', employeeActions.getStaffInfoAction);
  app.put('/api/v1/staff/:staffId', middleware.authenticate, employeeActions.updateStaffInfoAction);
  app.delete('/api/v1/staff/:staffId', middleware.authenticate, employeeActions.deleteStaffAction);
};

export default staffRoutes;
