import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import invoiceController from './invoice.controller';

const InvoiceRoutes = (app:express.Application): void => {
  app.post('/api/v1/invoice', invoiceController.createInvoiceAction);
  app.get('/api/v1/invoice', invoiceController.fetchInvoiceListByQueryAction);
  app.get('/api/v1/invoice/:id', invoiceController.fetchInvoiceInfoByQueryAction);
  app.put('/api/v1/invoice/:id', invoiceController.updateInvoiceAction);
  app.delete('/api/v1/invoice/:id', invoiceController.deleteInvoiceAction);
}