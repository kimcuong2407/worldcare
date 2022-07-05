import express from 'express';
import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import productReturnService from './productReturn.service';
import { PRODUCT_RETURN_STATUS } from './constant';

const logger = loggerHelper.getLogger('product-return.controller');

const createProductReturnAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const partnerId = req.user.partnerId;
    const branchId = get(req, 'companyId');
    const {
      refund,
    } = req.body;
    const info = {
      branchId,
      partnerId,
      cusotmerId: refund.customerId,
      createdBy: refund.createdBy,
      receivedBy: refund.receivedBy,
      invoiceId: refund.invoiceId,
      productReturnDetail: refund.productReturnDetail,
      payment: refund.payment,
      status: PRODUCT_RETURN_STATUS.COMPLETED,
      fee: refund.fee,
      discountValue: refund.discountValue,
      discountType: refund.discountType,
      note: refund.note
    };
    const record = await productReturnService.createProductReturn(info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
}

export default {
  createProductReturnAction
}