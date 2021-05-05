import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import contactService from './contact.service';
import map from 'lodash/map';
import pick from 'lodash/pick';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('contact.controller');

// DEGREE
const createContactAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      address,
      phoneNumber,
      email,
      message,
    } = req.body;

    if(!name || !phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập số điện thoại và tên.')
    }

    const contact = await contactService.createContact({
      name,
      address,
      phoneNumber,
      email,
      message,
    });

    res.send(contact);
  } catch (e) {
    logger.error('createContactAction', e);
    next(e);
  }
};


const updateContactAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const contactId = get(req.params, 'id');
    const contact = await contactService.updateContactById(contactId, req.body);

    res.send(contact);
  } catch (e) {
    logger.error('createContactAction', e);
    next(e);
  }
};


const fetchContactAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startTime, endTime, serviceId, hospitalId, status, source } = req.query;
    const contacts = await contactService.fetchContact(startTime, endTime, serviceId, hospitalId, status, source);
    res.send(contacts);
  } catch (e) {
    logger.error('createContactAction', e);
    next(e);
  }
};


const getContactByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const contactId = get(req.params, 'id');
    const raw = get(req.query, 'raw');

    const contact = await contactService.getContactById(contactId, raw);
    res.send(contact);
  } catch (e) {
    logger.error('getContactByIdAction', e);
    next(e);
  }
};


const deleteContactByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const contactId = get(req.params, 'id');
    
    const contact = await contactService.deleteContact(contactId);
    res.send(contact);
  } catch (e) {
    logger.error('deleteContactByIdAction', e);
    next(e);
  }
};

export default {
  createContactAction,
  deleteContactByIdAction,
  fetchContactAction,
  getContactByIdAction,
  updateContactAction,
}