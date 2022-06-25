import loggerHelper from '@app/utils/logger.util';
import express from 'express';
import get from 'lodash/get';
import paymentNoteService from './paymentNote.service';

const logger = loggerHelper.getLogger('payment-note.controller');

const createPaymentNoteAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const {
      type,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
      payerReceiver,
      paymentNoteTypeId
    } = req.body;
    const info = {
      type,
      branchId,
      createdById,
      paymentMethod,
      paymentDetail,
      paymentAmount,
      totalPayment,
      payerReceiver,
      paymentNoteTypeId
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
    const id = get(req.params, 'id');
    const query = { _id: id, branchId };
    const record = await paymentNoteService.fetchPaymentNoteInfoByQuery(query);
    res.send(record);
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
    const id = get(req.params, 'id');
    const query = { _id: id, branchId };
    const {
      involvedById,
      paymentMethod,
      paymentDetail,
      note,
      createdAt
    } =req.body;
    const info = {
      involvedById,
      paymentMethod,
      paymentDetail,
      note,
      createdAt
    };
    const record = await paymentNoteService.updatePaymentNote(query, info);
    res.send(record);
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
    const id = get(req.params, 'id');
    const query = { _id: id, branchId };
    const record = await paymentNoteService.deletePaymentNote(query);
    res.send(record);
  } catch (error) {
    logger.error('deletePaymentNoteAction', error);
    next(error);
  }
}

const searchPayerReceiverAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;
    const { keyword, target } = req.query;
    const data = await paymentNoteService.searchPayerReceiver(keyword as string, target as string, partnerId );
    res.send(data);
  } catch (error) {
    logger.error('searchPayerReceiverAction', error);
    next(error);
  }
}
export default {
  createPaymentNoteAction,
  fetchPaymentNoteListByQueryAction,
  fetchPaymentNoteInfoByQueryAction,
  updatePaymentNoteAction,
  deletePaymentNoteAction,
  searchPayerReceiverAction
};
