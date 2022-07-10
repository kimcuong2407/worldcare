import middleware from '@app/core/middleware';
import {CLINIC_RESOURCES, CORE_ACTIONS} from '@app/core/permissions';
import express from 'express';
import paymentNoteController from './paymentNote.controller';

const PaymentNoteRoutes = (app: express.Application): void => {

  app.post('/api/v1/payment-note', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), paymentNoteController.createPaymentNoteAction);

  // app.get('/api/v1/payment-note', middleware.authorization([
  //   [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  // ]), paymentNoteController.fetchPaymentNoteListByQueryAction);

  app.get('/api/v1/payment-note/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), paymentNoteController.fetchPaymentNoteInfoByQueryAction);

  app.put('/api/v1/payment-note/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), paymentNoteController.updatePaymentNoteAction);

  app.delete('/api/v1/payment-note/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  ]), paymentNoteController.deletePaymentNoteAction);

  app.get('/api/v1/payment-note/payer-receiver/search', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), paymentNoteController.searchPayerReceiverAction);
  
}

export default PaymentNoteRoutes;