import express from 'express';
import supplierActions from './supplier.controller';
import middleware from '@core/middleware';
import {CORE_ACTIONS, ROOT_RESOURCES} from '@core/permissions';

const supplierRoutes = (app: express.Application): void => {
  app.post('/api/v1/supplier', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.write]
  ]), supplierActions.createSupplierAction);
  app.get('/api/v1/supplier', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.read]
  ]), supplierActions.fetchSuppliersAction);
  app.get('/api/v1/supplier/:supplierId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.read]
  ]), supplierActions.getSupplierByIdAction);
  app.put('/api/v1/supplier/:supplierId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.update]
  ]), supplierActions.updateSupplierInfoAction);
  app.delete('/api/v1/supplier/:supplierId', middleware.authorization([
    [ROOT_RESOURCES.supplier, CORE_ACTIONS.delete]
  ]), supplierActions.deleteSupplierAction);
};

export default supplierRoutes;
