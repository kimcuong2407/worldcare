import loggerHelper from "@app/utils/logger.util";
import express from 'express';
import get from "lodash/get";
import paymentNoteService from "./payment-note.service";

const logger = loggerHelper.getLogger('payment-note.controller');

const createPaymentNoteAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const type = get(req.query, 'type');
    const {
      supplierId,
      customerId,
      involvedById,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
    } = req.body;
    const info = {
      type,
      branchId,
      supplierId,
      customerId,
      involvedById,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
    };
    const record = await paymentNoteService.createPaymentNote(info);
    res.send(record);
  } catch (error) {
    logger.error('createPaymentNoteAction', error);
    next(error);
  }
}
const fetchPaymentNoteListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const query = { branchId };
    const list = await paymentNoteService.fetchPaymentNoteListByQuery(query);
    return list;
  } catch (error) {
    logger.error('fetchPaymentNoteListByQueryAction', error);
    next(error);
  }
}
const fetchPaymentNoteInfoByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const record = await paymentNoteService.fetchPaymentNoteInfoByQuery(query);
    return record;
  } catch (error) {
    logger.error('fetchPaymentNoteInfoByQueryAction', error);
    next(error);
  }
}
const updatePaymentNoteAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const {
      supplierId,
      customerId,
      involvedById,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
    } =req.body;
    const info = {
      supplierId,
      customerId,
      involvedById,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
    };
    const record = await paymentNoteService.updatePaymentNote(query, info);
    return record;
  } catch (error) {
    logger.error('updatePaymentNoteAction', error);
    next(error);
  }
}
const deletePaymentNoteAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req, 'id');
    const query = { _id: id, branchId };
    const record = await paymentNoteService.fetchPaymentNoteInfoByQuery(query);
    return record;
  } catch (error) {
    logger.error('deletePaymentNoteAction', error);
    next(error);
  }
}
export default {
  createPaymentNoteAction,
  fetchPaymentNoteListByQueryAction,
  fetchPaymentNoteInfoByQueryAction,
  updatePaymentNoteAction,
  deletePaymentNoteAction,
};
