import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import loggerHelper from '@utils/logger.util';
import express from 'express';
import { isNil } from 'lodash';
import get from 'lodash/get';
import purchaseOrderService from './purchase-order.service';

const logger = loggerHelper.getLogger('purchase-order.controller');


const createPurchaseOrderAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const {
      supplierCode,
      createdById,
      receiverById,
      purchaseOrderDetail,
    } = req.body;
    const info = {
      branchId,
      supplierCode,
      createdById,
      receiverById,
      purchaseOrderDetail,
    }
    const record = await purchaseOrderService.createPurchaseOrder(info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchPurchaseOrderListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const query = { branchId };
    const list = await purchaseOrderService.fetchPurchaseOrderListByQuery(query);
    return list;
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchPurchaseOrderInfoByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId')  ;
    const id  = get(req, 'id');
    if (isNil(id)) throw new ValidationFailedError('id is required.');
    const record = await purchaseOrderService.fetchPurchaseOrderInfoByQuery({ _id: id, branchId });
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const updatePurchaseOrderAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId')  ;
    const id  = get(req, 'id');
    if (isNil(id)) throw new ValidationFailedError('id is required.');
    const {
      createdById,
      receiverById,
      purchaseOrderDetail,
    } = req.body;
    const info = {
      createdById,
      receiverById,
      purchaseOrderDetail,
    };
    const record = await purchaseOrderService.updatePurchaseOrder({ _id: id, branchId }, info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const deletePurchaseOrderAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId') ;
    const id = get(req, 'id');
    const record = await purchaseOrderService.deletePurchaseOrder({ _id: id, branchId });
    return record;
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};


export default {
  createPurchaseOrderAction,
  fetchPurchaseOrderListByQueryAction,
  fetchPurchaseOrderInfoByQueryAction,
  updatePurchaseOrderAction,
  deletePurchaseOrderAction,
};
