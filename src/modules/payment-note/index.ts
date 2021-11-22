import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import paymentNoteController from './payment-note.controller';

const PaymentNoteRoutes = (app:express.Application): void => {
  app.post('/api/v1/payment-note', paymentNoteController.createPaymentNoteAction);
  app.get('/api/v1/payment-note', paymentNoteController.fetchPaymentNoteListByQueryAction);
  app.get('/api/v1/payment-note/:id', paymentNoteController.fetchPaymentNoteInfoByQueryAction);
  app.put('/api/v1/payment-note/:id', paymentNoteController.updatePaymentNoteAction);
  app.delete('/api/v1/payment-note/:id', paymentNoteController.deletePaymentNoteAction);
}