import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';
import express from 'express';
import orderActions from './order.controller';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const orderRoutes = (app: express.Application): void => {
  app.post('/api/v1/medicine-order', middleware.jwt, orderActions.createOrderAction);
  app.post('/api/v1/prescription', upload.single('file'), orderActions.createPrescriptionAction);
};

export default orderRoutes;
