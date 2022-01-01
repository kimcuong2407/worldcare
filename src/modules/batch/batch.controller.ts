import express from 'express';
import loggerHelper from '@utils/logger.util';
import batchService from './batch.service';
import {isNil, get} from 'lodash'
import {ValidationFailedError} from '@core/types/ErrorTypes';
import ProductVariantCollection from '@modules/product/productVariant.collection';
import BatchCollection from '@modules/batch/batch.collection';
import {BATCH_STATUS} from '@modules/batch/constant';

const logger = loggerHelper.getLogger('supplier.controller');

const fetchBatchesAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const variantId = req.query.variantId;
    const branchId = req.companyId;

    const data = await batchService.fetchBatches(variantId, branchId);
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchBatchesAction', e);
    next(e);
  }
};

const createBatchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const {
      lotNumber,
      aliasName,
      variantId,
      manufacturingDate,
      expirationDate
    } = req.body;

    const batchInfo = {
      lotNumber,
      aliasName,
      variantId,
      manufacturingDate,
      expirationDate,
      branchId
    }

    await validateBatchInput(batchInfo);
    const productVariant = await ProductVariantCollection.findOne({
      _id: batchInfo.variantId,
      deletedAt: null,
      branchId: batchInfo.branchId
    }).lean();
    if (isNil(productVariant)) {
      throw new ValidationFailedError('Product variant can not be found.');
    }

    const existedBatch = await BatchCollection.findOne({
      variantId,
      manufacturingDate,
      expirationDate,
      lotNumber
    }).exec();
    if (existedBatch) {
      throw new ValidationFailedError('Batch is existed for this variant.');
    }

    const batch = await BatchCollection.create({
      ...batchInfo,
      productId: productVariant.productId,
      quantity: 0,
      status: BATCH_STATUS.ACTIVE
    })

    res.send(get(batch, '_doc'));
  } catch (e) {
    logger.error('Error while createBatchAction', e);
    next(e);
  }
};

async function validateBatchInput(batchInfo: any) {
  if (isNil(batchInfo.lotNumber)) {
    throw new ValidationFailedError('Lot number is required.');
  }
  if (isNil(batchInfo.expirationDate)) {
    throw new ValidationFailedError('Expiration date is required.');
  }
  if (isNil(batchInfo.variantId)) {
    throw new ValidationFailedError('Variant ID is required.');
  }
}

export default {
  fetchBatchesAction,
  createBatchAction
};
