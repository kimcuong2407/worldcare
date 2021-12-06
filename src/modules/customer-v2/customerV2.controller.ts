import express from 'express';
import loggerHelper from '@utils/logger.util';
import customerService from './customerV2.service';
import get from 'lodash/get';
import appUtil from '@app/utils/app.util';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';
import { isNil } from 'lodash';

const logger = loggerHelper.getLogger('customerV2.controller');

const createCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      code,
      name,
      phoneNumber,
      birthday,
      address,
      taxIdentificationNumber,
      type,
      email,
      facebook,
      group,
      note
    } = req.body;

    const partnerId = req.user.partnerId;
    
    const customerInfo: any = {
      code,
      name,
      phoneNumber,
      birthday,
      address,
      taxIdentificationNumber,
      type,
      email,
      facebook,
      group,
      note,
      partnerId
    };

    if (isNil(customerInfo.name)) {
      throw new ValidationFailedError('Customer name is required.');
    }
    if (customerInfo.code) {
      const existedCustomer = await customerService.getCustomerInfo({
        code: customerInfo.code,
        partnerId,
        deletedAt: null
      });
      if (existedCustomer) {
        throw new ValidationFailedError('Customer code is existed.');
      }
    }

    const data = await customerService.createCustomer(customerInfo);
    logger.info(`Created customer with ID=${get(data, '_id')} and code=${data.code}`);
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new customer', e);
    next(e);
  }
};


const fetchCustomersAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    const {keyword, code, name, phoneNumber, email} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const customersQuery: any = {
      keyword,
      code,
      name,
      phoneNumber,
      email,
      partnerId
    }
    const data = await customerService.fetchCustomers(customersQuery, options);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while fetching customers', e);
    next(e);
  }
};


const getCustomerByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;
    let customerId = get(req.params, 'customerId');
    const query: any = {
      _id: customerId,
      partnerId,
      deletedAt: null
    }
    const customer = await customerService.getCustomerInfo(query);
    if (!customer) {
      throw new NotFoundError();
    }

    res.send(customer);
  } catch (e) {
    logger.error('There was an error while get customer by ID', e);
    next(e);
  }
};


const updateCustomerInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;
    const customerId = get(req.params, 'customerId');

    const {
      code,
      name,
      phoneNumber,
      birthday,
      address,
      taxIdentificationNumber,
      type,
      email,
      facebook,
      group,
      note
    } = req.body;

    const customerInfo: any = {
      code,
      name,
      phoneNumber,
      birthday,
      address,
      taxIdentificationNumber,
      type,
      email,
      facebook,
      group,
      note,
      partnerId
    };

    if (isNil(customerInfo.name)) {
      throw new ValidationFailedError('Customer name is required.');
    }

    const query = {
      _id: customerId,
      partnerId,
      deletedAt: null
    };
    const existedCustomer = await customerService.getCustomerInfo(query);
    if (!existedCustomer) {
      throw new NotFoundError();
    }

    if (existedCustomer.code !== customerInfo.code) {
      const customer = await customerService.getCustomerInfo({
        partnerId, 
        code: customerInfo.code,
        deletedAt: null
      });
      if (customer) {
        throw new ValidationFailedError('Customer code is existed.');
      }
    }

    const data = await customerService.updateCustomerInfo(query, customerInfo);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while updating customer', e);
    next(e);
  }
};

const deleteCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    let customerId = get(req.params, 'customerId');
    const query: any = {
      _id: customerId,
      partnerId,
      deletedAt: null
    }
    const customer = await customerService.getCustomerInfo(query);
    if (!customer) {
      throw new NotFoundError();
    }

    const data = await customerService.deleteCustomer(customerId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while deleting customer', e);
    next(e);
  }
}


export default {
  createCustomerAction,
  fetchCustomersAction,
  getCustomerByIdAction,
  updateCustomerInfoAction,
  deleteCustomerAction
};
