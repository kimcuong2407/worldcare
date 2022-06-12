import loggerHelper from '@app/utils/logger.util';
import express from 'express';
import get from 'lodash/get';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import paymentNoteTypeService from './paymentNoteType.service';
import { PAYMENT_NOTE_TYPE } from '@modules/payment-note/constant';

const logger = loggerHelper.getLogger('payment-note.controller');

const createPaymentNoteTypeAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {

    const {
      type,
      name,
      description
    } = req.body;
    if (type !== PAYMENT_NOTE_TYPE.PAYMENT && type !== PAYMENT_NOTE_TYPE.RECEIPT) {
      throw new ValidationFailedError('Payment type shoudle be validate');
    }
    if (!name) {
      throw new ValidationFailedError('Name can not empty');
    }
    const info = {
      type,
      name,
      description
    };
    const record = await paymentNoteTypeService.createPaymentNoteType(info);
    res.send(record);
  } catch (error) {
    logger.error('createPaymentNoteAction', error);
    next(error);
  }
}
const fetchPaymentNoteTypeListByQueryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const type = get(req.query, 'type');
    const query = { type };
    const list = await paymentNoteTypeService.fetchPaymentNoteTypeListByQuery(query);
    res.send(list);
  } catch (error) {
    logger.error('fetchPaymentNoteListByQueryAction', error);
    next(error);
  }
}


export default {
  createPaymentNoteTypeAction,
  fetchPaymentNoteTypeListByQueryAction
};
