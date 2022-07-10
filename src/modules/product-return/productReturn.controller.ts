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
      note: refund.note,
      saleChannel: refund.saleChannel,
      totalReturn: refund.totalReturn
    };
    const record = await productReturnService.createProductReturn(info, false);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
}

const createProductExchangeAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const partnerId = req.user.partnerId;
    const branchId = get(req, 'companyId');
    const {
      refund,
      invoice
    } = req.body;
    const info = {
      branchId,
      partnerId,
      refund: {
        customerId: refund.customerId,
        createdBy: refund.createdById,
        receivedBy: refund.receivedById,
        invoiceId: refund.invoiceId,
        productReturnDetail: refund.productReturnDetail,
        payment: refund.payment,
        status: PRODUCT_RETURN_STATUS.COMPLETED,
        fee: refund.fee,
        discountValue: refund.discountValue,
        discountPercent: refund.discountPercent,
        discountType: refund.discountType,
        note: refund.note,
        saleChannel: refund.saleChannel,
        totalReturn: refund.totalReturn
      },
      invoice: {
        customerId: invoice.customerId,
        soldById: invoice.soldById,
        createdById: invoice.createdById,
        saleChannel: invoice.saleChannel,
        invoiceDetail: invoice.invoiceDetail,
        payment: refund.payment,
        discountValue: invoice.discountValue,
        discountPercent: invoice.discountPercent,
        discountType: invoice.discountType,
        total: invoice.total
      }
    };
    const record = await productReturnService.createProductExchange(info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
}

export default {
  createProductReturnAction,
  createProductExchangeAction
}