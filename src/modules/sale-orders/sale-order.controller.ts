import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import loggerHelper from '@utils/logger.util';
import express from 'express';
import { isNil } from 'lodash';
import get from 'lodash/get';
import saleOrderService from './sale-order.service';
import appUtil from '@utils/app.util';
import {Types} from 'mongoose';
import SaleOrderCollection from '@modules/sale-orders/sale-order.collection';

const logger = loggerHelper.getLogger('purchase-order.controller');


const createSaleOrderAction = async (
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
      saleOrderDetail,
    } = req.body;
    const info = {
      branchId,
      supplierCode,
      createdById,
      receiverById,
      saleOrderDetail,
    }
    const record = await saleOrderService.createSaleOrder(info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchSaleOrderListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const {keyword} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query = {
      branchId,
      keyword
    };
    const list = await saleOrderService.fetchSaleOrderListByQuery(query, options);
    return res.status(200).send(list);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchSaleOrderInfoByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId')  ;
    const id  = req.params.id;
    if (isNil(id) || !Types.ObjectId.isValid(id)) {
      throw new ValidationFailedError('ID is not valid.');
    }
    const record = await saleOrderService.fetchSaleOrderInfoByQuery({ _id: id, branchId });
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const updateSaleOrderAction = async (
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
      saleOrderDetail,
    } = req.body;
    const info = {
      createdById,
      receiverById,
      saleOrderDetail,
    };
    const record = await saleOrderService.updateSaleOrder({ _id: id, branchId }, info);
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const deleteSaleOrderAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId') ;
    const id = req.params.id;
    const voidPayment: boolean = req.query.voidPayment === 'true';
    const data = await saleOrderService.deleteSaleOrder(id, branchId, voidPayment);
    res.send(data);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};


export default {
  createSaleOrderAction,
  fetchSaleOrderListByQueryAction,
  fetchSaleOrderInfoByQueryAction,
  updateSaleOrderAction,
  deleteSaleOrderAction,
};
