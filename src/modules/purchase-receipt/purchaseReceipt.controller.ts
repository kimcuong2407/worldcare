import express from 'express';
import loggerHelper from '@utils/logger.util';
import purchaseReceiptService from './purchaseReceipt.service';
import {isNil} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import appUtil from '@utils/app.util';

const logger = loggerHelper.getLogger('purchaseReceipt.controller');

const createPurchaseReceipt = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const purchaseReceiptInfo = {
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

    const purchaseReceipt = await purchaseReceiptService.createPurchaseReceipt(purchaseReceiptInfo);
    res.send(purchaseReceipt);
  } catch (e) {
    logger.error('createPurchaseReceipt', e);
    next(e);
  }
};

const updatePurchaseReceipt = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const purchaseReceiptId = req.params.purchaseReceiptId;
    const purchaseReceipt = await purchaseReceiptService.getPurchaseReceipt({
      _id: purchaseReceiptId,
      branchId
    })
    if (isNil(purchaseReceipt)) {
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
    const purchaseReceiptInfo = {
      purchaseReceiptId,
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

    const data = await purchaseReceiptService.updatePurchaseReceipt(purchaseReceiptInfo);
    res.send(data);
  } catch (e) {
    logger.error('updatePurchaseReceipt', e);
    next(e);
  }
};

const fetchPurchaseReceipt = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const data = await purchaseReceiptService.fetchPurchaseReceipts(query, options);
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier', e);
    next(e);
  }
};

const fetchPurchaseReceiptById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const purchaseReceiptId = req.params.purchaseReceiptId;
    const purchaseReceipt = await purchaseReceiptService.getPurchaseReceipt({
      _id: purchaseReceiptId,
      branchId
    })
    if (isNil(purchaseReceipt)) {
      throw new ValidationFailedError('Can not find Purchase receipt.');
    }
    const data = await purchaseReceiptService.findById({
      _id: purchaseReceiptId,
      branchId
    });
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier', e);
    next(e);
  }
};

export default {
  create: createPurchaseReceipt,
  update: updatePurchaseReceipt,
  fetch: fetchPurchaseReceipt,
  getById: fetchPurchaseReceiptById
};
