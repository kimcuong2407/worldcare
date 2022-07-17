import express from 'express';
import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import productReturnService from './productReturn.service';
import { PRODUCT_RETURN_STATUS } from './constant';
import appUtil from '@app/utils/app.util';
import { isNil } from 'lodash';

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
      createdById: refund.createdById,
      receivedById: refund.receivedById,
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
        createdById: refund.createdById,
        receivedById: refund.receivedById,
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

const fetchProductReturnListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const partnerId = req.user.partnerId;
    const { status } = req.query;
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query = {
      status: status,
      branchId,
      partnerId
    };
    const record = await productReturnService.fetchProductReturnListByQuery(query, options);
    res.send(record);
  } catch (error) {
    logger.error('fetchProductReturnByQueryAction', error);
    next(error);
  }
}

const deleteProductReturnAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId') as number;
    const _id = get(req, 'params.id');
    const query = { _id };
    const record = await productReturnService.deleteProductReturn(query, branchId);
    res.send(record);
  } catch (error) {
    logger.error('deleteProductReturnAction', error);
    next(error);
  }
}
const updateProductReturnAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const {
      ids,
      saleChannel,
      receivedById
    } = req.body;
    const updateInfo = {} as any; 
    if(!isNil(saleChannel)){
      updateInfo.saleChannel = saleChannel;
    }
    if(!isNil(receivedById)){
      updateInfo.receivedById = receivedById;
    }
    for(const id of ids){
      await productReturnService.updateProductReturn({_id: id}, updateInfo);
    }
    res.send(true);
  } catch (error) {
    logger.error('updateProductReturnAction', error);
    next(error);
  }
}


export default {
  createProductReturnAction,
  createProductExchangeAction,
  deleteProductReturnAction,
  fetchProductReturnListByQueryAction,
  updateProductReturnAction
}