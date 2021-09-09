import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import userService from './user.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import appUtil from '@app/utils/app.util';
import jwtUtil from '@app/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { isNil, omitBy, xor } from 'lodash';

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

    await userService.addNewAddress({
      userId,
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
    await userService.updateAddress(userId, addressId, {
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
    const user = await userService.findUser({
      $or: [
        {
          phoneNumber
        }
      ]
    });
    if (user && user.length > 0) {
      throw new ValidationFailedError('Email hoặc số điện thoại đã được đăng ký với một tài khoản khác.');
    }
    const createdUser = await userService.registerUser(
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

    const token = jwtUtil.issueToken(get(createdUser, '_id'), sessionId);

    const auth = {
      userId: get(createdUser, '_id'),
      sessionId,
      token
    }
    res.send(auth);
  } catch (e) {
    logger.error('registerAction', e);
    next(e);
  }
};

const fetchUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const users = await userService.fetchUser({ keyword, branchId, groups: groups ? String(groups).split(',') : null }, options)
    res.send(users);
  } catch (e) {
    logger.error('fetchUserAction', e);
    next(e);
  }
}

const createUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
      username,
      password,
      groups,
      address,
    } = req.body;

    if (!username) {
      throw new ValidationFailedError('Vui lòng nhập vào tên đăng nhập.');
    }

    if (!password) {
      throw new ValidationFailedError('Vui lòng nhập vào mật khẩu.');
    }
    const user = await userService.findUser({
      username,
      branchId: Number(branchId),
    });
    if (user && user.length > 0) {
      throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    }
    const createdUser = await userService.createStaffAccount(
      {
        fullName,
        phoneNumber,
        email,
        gender,
        avatar,
        employeeNumber,
        username,
        password,
        groups,
        address,
        branchId,
        isCustomer: false,
      }
    );
    await userService.updateUserGroups(get(createdUser, '_id'), groups, branchId);
    res.send(setResponse(createdUser, true, 'Tài khoản đã được tạo thành công.'));
  } catch (e) {
    logger.error('createUserAction', e);
    next(e);
  }
}

const updateUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.body, 'branchId') || req.companyId;
    let userId = get(req.params, 'userId');

    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const user: any = await userService.findUser({
      _id: Types.ObjectId(userId),
      branchId: Number(branchId),
    });

    if (!user) {
      throw new NotFoundError();
    }

    const {
      fullName,
      phoneNumber,
      email,
      gender,
      avatar,
      employeeNumber,
      username,
      password,
      groups,
      address,
    } = req.body;

    if (username) {
      const user = await userService.findUser({
        username,
        _id: { $ne: Types.ObjectId(userId)},
        branchId: Number(branchId),
      });
      if (user && user.length > 0) {
        throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
      }
    }
    const updatedUser = await userService.updateStaffAccount(
      userId,
      {
        fullName,
        phoneNumber,
        email,
        gender,
        avatar,
        employeeNumber,
        username,
        password,
        groups,
        address,
        branchId,
      }
    );
    if(groups) {
      if(xor(groups, get(user, 'groups'))) {
        await userService.updateUserGroups(userId, groups, branchId);
      }
    }
    res.send(setResponse(updatedUser, true, 'Tài khoản đã được tạo thành công.'));
  } catch (e) {
    logger.error('updateUserAction', e);
    next(e);
  }
}


const updateUserProfileAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let userId = get(req.user, 'id');

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
    } = req.body;

    const updatedUser = await userService.updateUserProfile(
      userId,
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
  
    res.send(setResponse(updatedUser, true, 'Tài khoản đã được cập nhật thành công.'));
  } catch (e) {
    logger.error('updateUserProfileAction', e);
    next(e);
  }
}

const getUserDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.query, 'branchId');
    let userId = get(req.params, 'userId');
    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const user: any = await userService.getUserInfo({
      userId: userId,
      branchId: branchId ? Number(branchId) : null,
    });

    res.send(setResponse(user, true));
  } catch (e) {
    logger.error('getUserDetailAction', e);
    next(e);
  }
}


const deleteUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let branchId = get(req.body, 'branchId') || req.companyId;
    let userId = get(req.params, 'userId');

    if (!req.isRoot) {
      branchId = req.companyId;
    }

    const user: any = await userService.findUser({
      _id: Types.ObjectId(userId),
      branchId: Number(branchId),
    });

    if (!user) {
      throw new NotFoundError();
    }
    await userService.deleteUser(userId)
    res.send(setResponse({}, true, 'Tài khoản đã được xóa thành công.'));
  } catch (e) {
    logger.error('deleteUserAction', e);
    next(e);
  }
}


export default {
  getProfileAction,
  addNewAddressAction,
  fetchAddressAction,
  updateAddressAction,
  registerAction,
  fetchUserAction,
  createUserAction,
  updateUserAction,
  getUserDetailAction,
  deleteUserAction,
  updateUserProfileAction,
};
