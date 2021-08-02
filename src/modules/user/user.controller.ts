import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import userService from './user.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('user.controller');

const getProfileAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
  ) => {
  try {
    const user = await userService.getUserProfileById(get(req.user, 'id'));
    
    res.send(omit(user, 'password'));
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
    const userId = get(req.user, 'id');
    const {
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
    } = req.body;

    if(!fullName) {
      throw new ValidationFailedError('Vui lòng nhập tên người nhận.')
    }
    if(!phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập số điện thoại người nhận.')
    }
    if(!street) {
      throw new ValidationFailedError('Vui lòng nhập địa chỉ.')
    }
    if(!wardId) {
      throw new ValidationFailedError('Vui lòng chọn phường.')
    }
    if(!districtId) {
      throw new ValidationFailedError('Vui lòng chọn quận.')
    }
    if(!cityId) {
      throw new ValidationFailedError('Vui lòng chọn thành phố.')
    }

    await userService.addNewAddress({
      userId,
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
    });
    
    res.send({ status: true});
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
    const userId = get(req.user, 'id');
    const addresses = await userService.fetchAddressesByUserId(userId);
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
    const userId = get(req.user, 'id');
    const addressId = get(req.params, 'addressId');
    const {
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
    } = req.body;

    if(!fullName) {
      throw new ValidationFailedError('Vui lòng nhập tên người nhận.')
    }
    if(!phoneNumber) {
      throw new ValidationFailedError('Vui lòng nhập số điện thoại người nhận.')
    }
    if(!street) {
      throw new ValidationFailedError('Vui lòng nhập địa chỉ.')
    }
    if(!wardId) {
      throw new ValidationFailedError('Vui lòng chọn phường.')
    }
    if(!districtId) {
      throw new ValidationFailedError('Vui lòng chọn quận.')
    }
    if(!cityId) {
      throw new ValidationFailedError('Vui lòng chọn thành phố.')
    }
    await userService.updateAddress(userId, addressId,{
      street,
      wardId,
      districtId,
      cityId,
      isPrimary,
      fullName,
      phoneNumber,
    });
    res.send({
      status: true
    });
  } catch (e) {
    logger.error('updateAddressAction', e);
    next(e);
  }
};


export default { getProfileAction, addNewAddressAction, fetchAddressAction, updateAddressAction };
