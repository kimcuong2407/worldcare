import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import employeeActions from './employee.controller';

const employeeRoutes = (app: express.Application): void => {
  app.post('/api/v1/employee', middleware.authorization([
    [CORE_RESOURCES.employee, CORE_ACTIONS.write],
    [CORE_RESOURCES.partner, CORE_ACTIONS.write]
  ]), employeeActions.createEmployeeAction);

  app.get('/api/v1/employee', middleware.authorization([
    [CORE_RESOURCES.employee, CORE_ACTIONS.read],
    [CORE_RESOURCES.partner, CORE_ACTIONS.write]
  ]), employeeActions.fetchEmployeeAction);

  app.get('/api/v1/employee/:employeeId', middleware.authorization([
    [CORE_RESOURCES.employee, CORE_ACTIONS.read],
    [CORE_RESOURCES.partner, CORE_ACTIONS.write]
  ]), employeeActions.getEmployeeInfoAction);

  app.put('/api/v1/employee/:employeeId', middleware.authorization([
    [CORE_RESOURCES.employee, CORE_ACTIONS.update],
    [CORE_RESOURCES.partner, CORE_ACTIONS.write]
  ]), employeeActions.updateEmployeeInfoAction);

  app.delete('/api/v1/employee/:employeeId', middleware.authorization([
    [CORE_RESOURCES.employee, CORE_ACTIONS.delete],
    [CORE_RESOURCES.partner, CORE_ACTIONS.write]
  ]), employeeActions.createEmployeeAction);
};

export default employeeRoutes;
