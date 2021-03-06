import middleware from '@app/core/middleware';
import express from 'express';
import staffActions from './staff.controller';

const staffRoutes = (app: express.Application): void => {
  app.post('/api/v1/staff', middleware.authenticate, staffActions.createStaffAction);
  app.get('/api/v1/staff', staffActions.fetchStaffAction);
  app.get('/api/v1/staff/:staffId', staffActions.getStaffInfoAction);
  app.put('/api/v1/staff/:staffId', middleware.authenticate, staffActions.updateStaffInfoAction);
  app.delete('/api/v1/staff/:staffId', middleware.authenticate, staffActions.deleteStaffAction);
};

export default staffRoutes;
