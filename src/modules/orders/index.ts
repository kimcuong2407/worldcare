import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import orderActions from './order.controller';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const orderRoutes = (app: express.Application): void => {
  app.post('/api/v1/medicine-order', middleware.jwt, orderActions.createOrderAction);

  app.get('/api/v1/order', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.read],
    [CORE_RESOURCES.order, CORE_ACTIONS.admin]
  ]), orderActions.getOrderAction);

  app.get('/api/v1/order/pending', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.read]
  ]), orderActions.getPendingOrderAction);

  app.get('/api/v1/order/:orderNumber', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.read]
  ]), orderActions.getOrderDetailAction);

  app.put('/api/v1/order/:orderNumber/:action(assign|confirm)', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.admin]
  ]), orderActions.handleOrderAction);

  app.put('/api/v1/order/:orderNumber/:action(process|update-item|complete-order|shipping|package|reject)', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.update]
  ]), orderActions.handleOrderAction);

  app.put('/api/v1/order/:orderNumber/:action(cancel|complete)', middleware.authorization([
    [CORE_RESOURCES.order, CORE_ACTIONS.update],
    [CORE_RESOURCES.order, CORE_ACTIONS.admin]
  ]), orderActions.handleOrderAction);

  app.post('/api/v1/prescription', upload.single('file'), orderActions.createPrescriptionAction);
  app.get('/api/v1/me/order', middleware.authenticate, orderActions.getMyOrderAction);
  app.get('/api/v1/me/order/:orderNumber', middleware.authenticate, orderActions.getMyOrderDetailAction);
};

export default orderRoutes;

