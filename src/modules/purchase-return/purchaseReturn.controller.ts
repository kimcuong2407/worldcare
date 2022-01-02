import express from 'express';
import loggerHelper from '@utils/logger.util';
import purchaseReturnService from './purchaseReturn.service';
import {get, isNil} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import appUtil from '@utils/app.util';
import {PURCHASE_RETURN_STATUS} from '@modules/purchase-return/constant';

const logger = loggerHelper.getLogger('purchaseReturn.controller');

const createPurchaseReturn = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const {
      purchaseReturnItems,
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
    const purchaseReturnInfo = {
      purchaseReturnItems,
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

    const purchaseReturn = await purchaseReturnService.createPurchaseReturn(purchaseReturnInfo);

    const data = await purchaseReturnService.findByQuery({
      _id: purchaseReturn['_id'],
      branchId
    });
    res.send(data);
  } catch (e) {
    logger.error('createPurchaseReturn', e);
    next(e);
  }
};

const updatePurchaseReturn = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const id = req.params.id;
    const purchaseReturn = await purchaseReturnService.getPurchaseReturn({
      _id: id,
      branchId
    })
    if (isNil(purchaseReturn)) {
      throw new ValidationFailedError('Can not find Purchase Return.');
    }

    const {
      code,
      purchaseReturnItems,
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
    const purchaseReturnInfo = {
      code,
      purchaseReturnItems,
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

    const data = await purchaseReturnService.updatePurchaseReturn(id, purchaseReturnInfo);
    res.send(data);
  } catch (e) {
    logger.error('updatePurchaseReturn', e);
    next(e);
  }
};

const fetchPurchaseReturn = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {keyword, status} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query: any = {
      keyword,
      status
    }
    const data = await purchaseReturnService.fetchPurchaseReturns(query, options);
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchPurchaseReturn', e);
    next(e);
  }
};

const fetchPurchaseReturnById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const id = req.params.id;

    const data = await purchaseReturnService.findByQuery({
      _id: id,
      branchId
    });
    if (isNil(data)) {
      throw new ValidationFailedError('Can not find Purchase Return.');
    }
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchPurchaseReturnById', e);
    next(e);
  }
};

const cancelPurchaseReturnById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const id = req.params.id;
    const purchaseReturn = await purchaseReturnService.getPurchaseReturn({
      _id: id,
      branchId
    })
    if (isNil(purchaseReturn)) {
      throw new ValidationFailedError('Can not find Purchase Return.');
    }
    if (get(purchaseReturn, '_doc.status') === PURCHASE_RETURN_STATUS.CANCELED) {
      throw new ValidationFailedError('Purchase Return is already canceled.');
    }
    const voidPayment: boolean = req.query.voidPayment === 'true';
    const data = await purchaseReturnService.cancelPurchaseReturn(id, voidPayment);
    res.send(data);
  } catch (e) {
    logger.error('Error while cancelPurchaseReturnById', e);
    next(e);
  }
};

export default {
  create: createPurchaseReturn,
  update: updatePurchaseReturn,
  fetch: fetchPurchaseReturn,
  getById: fetchPurchaseReturnById,
  cancelAction: cancelPurchaseReturnById
};
