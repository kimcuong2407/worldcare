import loggerHelper from '@app/utils/logger.util';
import express from 'express';
import get from 'lodash/get';
import invoiceService from './invoice.service';
import appUtil from '@utils/app.util';
import {Types} from 'mongoose';
import {NotFoundError, ValidationFailedError} from '@core/types/ErrorTypes';
import {isNil} from 'lodash';

const logger = loggerHelper.getLogger('invoice.controller');

const createInvoiceAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const {
      customerId,
      soldById,
      createdById,
      saleChannel,
      invoiceDetail,
      paymentNote,
    } = req.body;
    const info = {
      branchId,
      customerId,
      soldById,
      createdById,
      saleChannel,
      invoiceDetail,
      paymentNote,
    };
    const record = await invoiceService.createInvoice(info);
    res.send(record);
  } catch (error) {
    logger.error('createInvoiceAction', error);
    next(error);
  }
};

const fetchInvoiceListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const partnerId = req.user.partnerId;
    const {keyword, status, batchInfo, customerInfo, productCode, productName, fromDate, toDate} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query = {
      branchId,
      keyword,
      status,
      batchInfo,
      customerInfo,
      productCode,
      productName,
      partnerId,
      fromDate,
      toDate
    };
    const list = await invoiceService.fetchInvoiceListByQuery(query, options);
    return res.send(list);
  } catch (error) {
    logger.error('fetchInvoiceListByQueryAction', error);
    next(error);
  }
};

const fetchInvoiceInfoByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = req.params.id;
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ValidationFailedError('ID is not valid.');
    }
    const query = { _id: id, branchId };
    const record = await invoiceService.fetchInvoiceInfoByQuery(query);
    if (isNil(record)) {
      throw new NotFoundError('Invoice could not be found.');
    }
    return res.send(record);
  } catch (error) {
    logger.error('fetchInvoiceInfoByQueryAction', error);
    next(error);
  }
};

const updateInvoiceAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const {
      customerId,
      soldById,
      createdById,
      saleChannel,
      invoiceDetail,
      paymentmNote,
    } = req.body;
    const info = {
      customerId,
      soldById,
      createdById,
      saleChannel,
      invoiceDetail,
      paymentmNote,
    };
    const record = await invoiceService.updateInvoice(query, info);
    return record;
  } catch (error) {
    logger.error('updateInvoiceAction', error);
    next(error);
  }
};

const deleteInvoiceAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = req.params.id;
    const voidPayment: boolean = req.query.voidPayment === 'true';
    const data = await invoiceService.cancelInvoice(id, branchId, voidPayment);
    res.send(data);
  } catch (error) {
    logger.error('deleteInvoiceAction', error);
    next(error);
  }
};

export default {
  createInvoiceAction,
  fetchInvoiceListByQueryAction,
  fetchInvoiceInfoByQueryAction,
  updateInvoiceAction,
  deleteInvoiceAction,
};
