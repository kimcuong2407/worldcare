import middleware from '@app/core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS, ROOT_RESOURCES} from '@app/core/permissions';
import express from 'express';
import invoiceController from './invoice.controller';

const invoiceRoutes = (app: express.Application): void => {
  app.post('/api/v1/invoice', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), invoiceController.createInvoiceAction);

  app.get('/api/v1/invoice', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), invoiceController.fetchInvoiceListByQueryAction);

  app.get('/api/v1/invoice/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), invoiceController.fetchInvoiceInfoByQueryAction);

  app.put('/api/v1/invoice/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), invoiceController.updateInvoiceAction);

  app.delete('/api/v1/invoice/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  ]), invoiceController.deleteInvoiceAction);

}

export default invoiceRoutes;