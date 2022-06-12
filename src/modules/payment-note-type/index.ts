import middleware from '@app/core/middleware';
import { CLINIC_RESOURCES, CORE_ACTIONS } from '@app/core/permissions';
import express from 'express';
import paymentNoteTypeController from './paymentNoteType.controller';

const paymentNoteTypeRoutes = (app: express.Application): void => {

  app.post('/api/v1/payment-note-type', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), paymentNoteTypeController.createPaymentNoteTypeAction);

  app.get('/api/v1/payment-note-type', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), paymentNoteTypeController.fetchPaymentNoteTypeListByQueryAction);

}

export default paymentNoteTypeRoutes;