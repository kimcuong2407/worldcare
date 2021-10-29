import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES, PHARMACY_RESOURCES, ROOT_ACTIONS } from '@app/core/permissions';
import express from 'express';
import orderActions from './order.controller';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const orderRoutes = (app: express.Application): void => {
  app.post('/api/v1/medicine-order', middleware.jwt, orderActions.createOrderAction);

  app.get('/api/v1/order', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read],
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.getOrderAction);

  app.get('/api/v1/order-report/monthly', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read],
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.getMonthlyOrderReportAction);

  app.get('/api/v1/order-report/daily', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read],
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.getDailyOrderReportAction);

  app.get('/api/v1/order-report/overview', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read],
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.getOrderOverviewReportAction);
  
  app.get('/api/v1/order/pending', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read]
  ]), orderActions.getPendingOrderAction);

  app.get('/api/v1/order/:orderNumber', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.read]
  ]), orderActions.getOrderDetailAction);

  app.put('/api/v1/order/:orderNumber/:action(assign|confirm)', middleware.authorization([
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.handleOrderAction);

  app.put('/api/v1/order/:orderNumber/:action(process|update-item|complete-order|shipping|package|reject)', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.update]
  ]), orderActions.handleOrderAction);

  app.put('/api/v1/order/:orderNumber/:action(cancel|complete|reject)', middleware.authorization([
    [PHARMACY_RESOURCES.order, CORE_ACTIONS.update],
    [PHARMACY_RESOURCES.order, ROOT_ACTIONS.admin]
  ]), orderActions.handleOrderAction);

  app.post('/api/v1/prescription', upload.single('file'), orderActions.createPrescriptionAction);
  app.get('/api/v1/me/order', middleware.authenticate, orderActions.getMyOrderAction);
  app.get('/api/v1/me/order/:orderNumber', middleware.authenticate, orderActions.getMyOrderDetailAction);
  app.put('/api/v1/me/order/:orderNumber/cancel', middleware.authenticate, orderActions.cancelMyOrderAction);
  app.post('/api/v1/order-tracking', middleware.jwt, orderActions.trackingOrderAction);

};

export default orderRoutes;

