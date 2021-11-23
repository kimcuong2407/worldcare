import loggerHelper from '@app/utils/logger.util';
import express from 'express';
import get from 'lodash/get';
import invoiceService from './invoice.service';

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
      paymentmNote,
    } = req.body;
    const info = {
      branchId,
      customerId,
      soldById,
      createdById,
      saleChannel,
      invoiceDetail,
      paymentmNote,
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
    const query = { branchId };
    const list = await invoiceService.fetchInvoiceListByQuery(query);
    return list;
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
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const record = await invoiceService.fetchInvoiceInfoByQuery(query);
    return record;
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
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const record = await invoiceService.deleteInvoice(query);
    return record;
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
