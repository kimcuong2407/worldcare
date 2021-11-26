import express from 'express';
import supplierGroupActions from './supplierGroup.controller';
import middleware from '@core/middleware';
import {CORE_ACTIONS, ROOT_RESOURCES} from '@core/permissions';

const supplierRoutes = (app: express.Application): void => {
  app.post('/api/v1/supplier-group', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.write]
  ]), supplierGroupActions.create);
  app.get('/api/v1/supplier-group', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.read]
  ]), supplierGroupActions.fetchSuppliersAction);
  app.get('/api/v1/supplier-group/:supplierGroupId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.read]
  ]), supplierGroupActions.getSupplierGroupByIdAction);
  app.put('/api/v1/supplier-group/:supplierGroupId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.update]
  ]), supplierGroupActions.updateSupplierGroupInfoAction);
  app.delete('/api/v1/supplier-group/:supplierGroupId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.delete]
  ]), supplierGroupActions.deleteSupplierGroupAction);
};

export default supplierRoutes;
