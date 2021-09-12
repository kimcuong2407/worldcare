import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import customerAccountService from './customer-account.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import appUtil from '@app/utils/app.util';
import jwtUtil from '@app/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { isNil, omitBy, xor } from 'lodash';
import authService from '../auth/auth.service';
import branchService from '../branch/branch.service';

const logger = loggerHelper.getLogger('customer-account.controller');

const getProfileAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customer = await customerAccountService.getCustomerAccountProfileById(get(req.user, 'id'));

    res.send(omit(customer, 'password'));
  } catch (e) {
    logger.error('getProfileAction', e);
    next(e);
  }
};

const addNewAddressAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customerAccountId = get(req.user, 'id');
    const {
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
      email,
    } = req.body;

    if (!fullName) {
      throw new ValidationFailedError('Vui lòng nhập tên người nhận.')
    }
    if (!phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập số điện thoại người nhận.')
    }
    if (!street) {
      throw new ValidationFailedError('Vui lòng nhập địa chỉ.')
    }
    if (!wardId) {
      throw new ValidationFailedError('Vui lòng chọn phường.')
    }
    if (!districtId) {
      throw new ValidationFailedError('Vui lòng chọn quận.')
    }
    if (!cityId) {
      throw new ValidationFailedError('Vui lòng chọn thành phố.')
    }

    await customerAccountService.addNewAddress({
      customerAccountId,
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
      email,
    });

    res.send({ status: true });
  } catch (e) {
    logger.error('addNewAddressAction', e);
    next(e);
  }
};

const fetchAddressAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customerAccountId = get(req.user, 'id');
    const addresses = await customerAccountService.fetchAddressesByCustomerAccountId(customerAccountId);
    res.send(addresses);
  } catch (e) {
    logger.error('fetchAddressAction', e);
    next(e);
  }
};

const updateAddressAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customerAccountId = get(req.user, 'id');
    const addressId = get(req.params, 'addressId');
    const {
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
      email,
    } = req.body;

    if (!fullName) {
      throw new ValidationFailedError('Vui lòng nhập tên người nhận.')
    }
    if (!phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập số điện thoại người nhận.')
    }
    if (!street) {
      throw new ValidationFailedError('Vui lòng nhập địa chỉ.')
    }
    if (!wardId) {
      throw new ValidationFailedError('Vui lòng chọn phường.')
    }
    if (!districtId) {
      throw new ValidationFailedError('Vui lòng chọn quận.')
    }
    if (!cityId) {
      throw new ValidationFailedError('Vui lòng chọn thành phố.')
    }
    await customerAccountService.updateAddress(customerAccountId, addressId, {
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
      email,
    });
    res.send({
      status: true
    });
  } catch (e) {
    logger.error('updateAddressAction', e);
    next(e);
  }
};

const registerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      phoneNumber,
      email,
      password,
      firstName,
      lastName,
      fullName,
      name,
    } = req.body;

    if (!phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập vào số điện thoại.');
    }

    if (!password) {
      throw new ValidationFailedError('Vui lòng nhập vào mật khẩu.');
    }
    const customer = await customerAccountService.findCustomerAccount({
      $or: [
        {
          phoneNumber
        }
      ]
    });
    if (customer && customer.length > 0) {
      throw new ValidationFailedError('Email hoặc số điện thoại đã được đăng ký với một tài khoản khác.');
    }
    const createdCustomer = await customerAccountService.registerCustomerAccount(
      {
        phoneNumber,
        email,
        password,
        firstName,
        lastName,
        fullName: name || fullName,
      }
    );
    const sessionId = uuidv4();

    const token = jwtUtil.issueToken(get(createdCustomer, '_id'), sessionId);

    const auth = {
      customerAccountId: get(createdCustomer, '_id'),
      sessionId,
      token
    }
    res.send(auth);
  } catch (e) {
    logger.error('registerAction', e);
    next(e);
  }
};

const fetchCustomerAccountAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    let branchId = get(req.query, 'branchId') || req.companyId;
    let groups = get(req.query, 'groups');
    const keyword = get(req.query, 'keyword');
    if (!req.isRoot) {
      branchId = req.companyId;
    }
    const customers = await customerAccountService.fetchCustomerAccount({ keyword, branchId, groups: groups ? String(groups).split(',') : null }, options)
    res.send(customers);
  } catch (e) {
    logger.error('fetchCustomerAccountAction', e);
    next(e);
  }
}

const updateCustomerProfileAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let customerAccountId = get(req.user, 'id');

    const {
      fullName,
      idNumber,
      dob,
      gender,
      bloodType,
      phoneNumber,
      email,
      avatar,
      address,
      currentPassword,
      newPassword,
    } = req.body;

    const updatedCustomer = await customerAccountService.updateCustomerAccountProfile(
      customerAccountId,
      omitBy({
        fullName,
        idNumber,
        dob,
        gender,
        bloodType,
        phoneNumber,
        email,
        avatar,
        address,
      }, isNil),
    );
    if(currentPassword && newPassword) {
      await authService.changePasswordByUserId(customerAccountId, currentPassword, newPassword);
    }
  
    res.send(setResponse(updatedCustomer, true, 'Tài khoản đã được cập nhật thành công.'));
  } catch (e) {
    logger.error('updateCustomerProfileAction', e);
    next(e);
  }
}

const getCustomerDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.query, 'branchId');
    let customerAccountId = get(req.params, 'customerAccountId');
    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const customer: any = await customerAccountService.getCustomerAccountInfo({
      customerAccountId: customerAccountId,
      branchId: branchId ? Number(branchId) : null,
    });

    res.send(setResponse(customer, true));
  } catch (e) {
    logger.error('getCustomerDetailAction', e);
    next(e);
  }
}


// const deleteCustomerAccountAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   try {
//     let branchId = get(req.body, 'branchId') || req.companyId;
//     let customerAccountId = get(req.params, 'customerAccountId');

//     if (!req.isRoot) {
//       branchId = req.companyId;
//     }

//     const customer: any = await customerAccountService.findCustomerAccount({
//       _id: Types.ObjectId(customerAccountId),
//       branchId: Number(branchId),
//     });

//     if (!customer) {
//       throw new NotFoundError();
//     }
//     await customerAccountService.deleteCustomerAccount(customerAccountId)
//     res.send(setResponse({}, true, 'Tài khoản đã được xóa thành công.'));
//   } catch (e) {
//     logger.error('deleteCustomerAccountAction', e);
//     next(e);
//   }
// }


export default {
  getProfileAction,
  addNewAddressAction,
  fetchAddressAction,
  updateAddressAction,
  registerAction,
  fetchCustomerAccountAction,
  // createCustomerAction,
  // updateCustomerAction,
  getCustomerDetailAction,
  // deleteCustomerAccountAction,
  updateCustomerProfileAction,
};
