import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import customerService from './customer.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import appUtil from '@app/utils/app.util';
import jwtUtil from '@app/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { xor } from 'lodash';

const logger = loggerHelper.getLogger('customer.controller');

const fetchCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    let branchId = req.companyId;
    const keyword = get(req.query, 'keyword');
    const phoneNumber = get(req.query, 'phoneNumber');
    const email = get(req.query, 'email');

    const customers = await customerService.fetchCustomer({ keyword, branchId, phoneNumber, email }, options)
    res.send(customers);
  } catch (e) {
    logger.error('fetchCustomerAction', e);
    next(e);
  }
}

const createCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.body, 'branchId') || req.companyId;
    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const {
      fullName,
      phoneNumber,
      email,
      gender,
      avatar,
      employeeNumber,
      customername,
      password,
      groups,
      address,
    } = req.body;

    if (!customername) {
      throw new ValidationFailedError('Vui lòng nhập vào tên đăng nhập.');
    }

    if (!password) {
      throw new ValidationFailedError('Vui lòng nhập vào mật khẩu.');
    }
    const customer = await customerService.findCustomer({
      customername,
      branchId: Number(branchId),
    });
    if (customer && customer.length > 0) {
      throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    }
    const createdCustomer = await customerService.createStaffAccount(
      {
        fullName,
        phoneNumber,
        email,
        gender,
        avatar,
        employeeNumber,
        customername,
        password,
        groups,
        address,
        branchId,
      }
    );
    console.log(get(createdCustomer, '_id'), groups, branchId)
    await customerService.updateCustomerGroups(get(createdCustomer, '_id'), groups, branchId);
    res.send(setResponse(createdCustomer, true, 'Tài khoản đã được tạo thành công.'));
  } catch (e) {
    logger.error('createCustomerAction', e);
    next(e);
  }
}

const updateCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.body, 'branchId') || req.companyId;
    let customerId = get(req.params, 'customerId');

    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const customer: any = await customerService.findCustomer({
      _id: Types.ObjectId(customerId),
      branchId: Number(branchId),
    });

    if (!customer) {
      throw new NotFoundError();
    }

    const {
      fullName,
      phoneNumber,
      email,
      gender,
      avatar,
      employeeNumber,
      customername,
      password,
      groups,
      address,
    } = req.body;

    if (customername) {
      const customer = await customerService.findCustomer({
        customername,
        _id: { $ne: Types.ObjectId(customerId)},
        branchId: Number(branchId),
      });
      if (customer && customer.length > 0) {
        throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
      }
    }
    const updatedCustomer = await customerService.updateStaffAccount(
      customerId,
      {
        fullName,
        phoneNumber,
        email,
        gender,
        avatar,
        employeeNumber,
        customername,
        password,
        groups,
        address,
        branchId,
      }
    );
    if(groups) {
      if(xor(groups, get(customer, 'groups'))) {
        await customerService.updateCustomerGroups(customerId, groups, branchId);
      }
    }
    res.send(setResponse(updatedCustomer, true, 'Tài khoản đã được tạo thành công.'));
  } catch (e) {
    logger.error('updateCustomerAction', e);
    next(e);
  }
}

const getCustomerDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.query, 'branchId');
    let customerId = get(req.params, 'customerId');
    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const customer: any = await customerService.getCustomerInfo({
      customerId: customerId,
      branchId: branchId ? Number(branchId) : null,
    });

    res.send(setResponse(customer, true));
  } catch (e) {
    logger.error('getCustomerDetailAction', e);
    next(e);
  }
}


const deleteCustomerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.body, 'branchId') || req.companyId;
    let customerId = get(req.params, 'customerId');

    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const customer: any = await customerService.findCustomer({
      _id: Types.ObjectId(customerId),
      branchId: Number(branchId),
    });

    if (!customer) {
      throw new NotFoundError();
    }
    await customerService.deleteCustomer(customerId)
    res.send(setResponse({}, true, 'Tài khoản đã được xóa thành công.'));
  } catch (e) {
    logger.error('deleteCustomerAction', e);
    next(e);
  }
}


export default {
  fetchCustomerAction,
  createCustomerAction,
  updateCustomerAction,
  getCustomerDetailAction,
  deleteCustomerAction,
};
