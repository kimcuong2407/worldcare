import middleware from '@app/core/middleware';
import express from 'express';
import staffActions from './staff.controller';

const staffRoutes = (app: express.Application): void => {
  app.post('/api/v1/staff', staffActions.createStaffAction);
  app.get('/api/v1/staff', staffActions.fetchStaffAction);
  app.get('/api/v1/staff/:staffId', staffActions.fetchStaffInfoAction);
  app.put('/api/v1/staff/:staffId', staffActions.updateStaffInfoAction);
  app.delete('/api/v1/staff/:staffId', staffActions.deleteStaffAction);
};

export default staffRoutes;
