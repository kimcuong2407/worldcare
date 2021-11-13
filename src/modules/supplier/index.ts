import express from 'express';
import supplierActions from './supplier.controller';

const supplierRoutes = (app: express.Application): void => {
  app.post('/api/v1/supplier', supplierActions.createSupplierAction);
  app.get('/api/v1/supplier', supplierActions.fetchSuppliersAction);
  app.get('/api/v1/supplier/:supplierCode', supplierActions.getSupplierByIdAction);
  app.put('/api/v1/supplier/:supplierCode', supplierActions.updateSupplierInfoAction);
  app.delete('/api/v1/supplier/:supplierCode', supplierActions.deleteSupplierAction);
};

export default supplierRoutes;
