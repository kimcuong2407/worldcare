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
      involvedBy,
      status,
      discountValue,
      discountPercent,
      discountType,
      note,
      purchasedAt
    } = req.body;

    // Create purchase receipt
    const purchaseOrderInfo = {
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      involvedBy,
      status,
      branchId,
      partnerId,
      createdBy: req.user.id,
      discountValue,
      discountPercent,
      discountType,
      note,
      purchasedAt
    }

    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(purchaseOrderInfo);

    const data = await purchaseOrderService.findById({
      _id: purchaseOrder['_id'],
      branchId
    });
    res.send(data);
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
      involvedBy,
      status,
      discountValue,
      discountPercent,
      discountType,
      note,
      purchasedAt
    } = req.body;

    // Update purchase receipt
    const purchaseOrderInfo = {
      purchaseOrderId,
      purchaseItems,
      supplierId,
      payment,
      involvedById,
      involvedBy,
      status,
      branchId,
      partnerId,
      discountValue,
      discountPercent,
      discountType,
      note,
      purchasedAt
    }

    const data = await purchaseOrderService.updatePurchaseOrder(purchaseOrderId, purchaseOrderInfo);
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
    logger.error('Error while fetchPurchaseOrder', e);
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
    logger.error('Error while fetchPurchaseOrderById', e);
    next(e);
  }
};

const deletePurchaseOrderById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const removePaymentNote: boolean = req.query.removePaymentNote === 'true';
    const data = await purchaseOrderService.deletePurchaseOrder(purchaseOrderId, removePaymentNote);
    res.send(data);
  } catch (e) {
    logger.error('Error while deletePurchaseOrderById', e);
    next(e);
  }
};

export default {
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  fetch: fetchPurchaseOrder,
  getById: fetchPurchaseOrderById,
  deleteAction: deletePurchaseOrderById
};
