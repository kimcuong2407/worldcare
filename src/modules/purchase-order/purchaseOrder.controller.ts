import express from 'express';
import loggerHelper from '@utils/logger.util';
import purchaseOrderService from './purchaseOrder.service';
import {isNil} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import appUtil from '@utils/app.util';

const logger = loggerHelper.getLogger('purchaseOrder.controller');

const createPurchaseOrder = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const {
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      status,
      discountValue,
      discountPercent,
      discountType
    } = req.body;

    // Create purchase receipt
    const purchaseOrderInfo = {
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      status,
      branchId,
      partnerId,
      createdBy: req.user.id,
      discountValue,
      discountPercent,
      discountType
    }

    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(purchaseOrderInfo);
    res.send(purchaseOrder);
  } catch (e) {
    logger.error('createPurchaseOrder', e);
    next(e);
  }
};

const updatePurchaseOrder = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const purchaseOrderId = req.params.purchaseOrderId;
    const purchaseOrder = await purchaseOrderService.getPurchaseOrder({
      _id: purchaseOrderId,
      branchId
    })
    if (isNil(purchaseOrder)) {
      throw new ValidationFailedError('Can not find Purchase receipt.');
    }

    const {
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      status,
      discountValue,
      discountPercent,
      discountType

    } = req.body;

    // Update purchase receipt
    const purchaseOrderInfo = {
      purchaseOrderId,
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      status,
      branchId,
      partnerId,
      discountValue,
      discountPercent,
      discountType
    }

    const data = await purchaseOrderService.updatePurchaseOrder(purchaseOrderInfo);
    res.send(data);
  } catch (e) {
    logger.error('updatePurchaseOrder', e);
    next(e);
  }
};

const fetchPurchaseOrder = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {keyword} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query: any = {
      keyword
    }
    const data = await purchaseOrderService.fetchPurchaseOrders(query, options);
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier', e);
    next(e);
  }
};

const fetchPurchaseOrderById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const purchaseOrderId = req.params.purchaseOrderId;
    const purchaseOrder = await purchaseOrderService.getPurchaseOrder({
      _id: purchaseOrderId,
      branchId
    })
    if (isNil(purchaseOrder)) {
      throw new ValidationFailedError('Can not find Purchase receipt.');
    }
    const data = await purchaseOrderService.findById({
      _id: purchaseOrderId,
      branchId
    });
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier', e);
    next(e);
  }
};

export default {
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  fetch: fetchPurchaseOrder,
  getById: fetchPurchaseOrderById
};
