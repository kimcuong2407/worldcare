import express from 'express';
import loggerHelper from '@utils/logger.util';
import employeeService from './employee.service';
import slugify from 'slugify';
import { normalizeText } from 'normalize-text';
import get from 'lodash/get';
import identity from 'lodash/identity';
import lowerCase from 'lodash/lowerCase';
import pickBy from 'lodash/pickBy';
import trim from 'lodash/trim';
import appUtil from '@app/utils/app.util';
import { Types } from 'mongoose';
import hospitalService from '@app/modules/hospital/hospital.service';
import configurationService from '@app/modules/configuration/configuration.service';
import { isNil, isUndefined, map, omitBy, xor } from 'lodash';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import userService from '../user/user.service';

const logger = loggerHelper.getLogger('employee.controller');

const createEmployeeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      address,
      description,
      gender,
      title,
      degree,
      speciality,
      avatar,
      employeeHistory,
      phoneNumber,
      password,
      employeeGroup,
      certification,
      email,
      groups,
      username,
      branchId,
    } = req.body;
    if (!firstName || !lastName ){
      throw new ValidationFailedError('First name and last name are required.');
    }
    let entityId = branchId || req.companyId;
    if(!req.isRoot) {
      entityId = req.companyId;
    }
    // const createdUser = await userService.findUser({username: username, branchId: Number(entityId)});
    // console.log(createdUser)
    // if(createdUser && createdUser.length > 0) {
    //   throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    // }

    const employeeInfo: any = {
      firstName,
      lastName,
      address,
      description,
      gender,
      title,
      degree,
      speciality,
      avatar,
      employeeHistory,
      phoneNumber,
      password,
      username,
      employeeGroup,
      certification,
      email,
      groups,
      branchId: entityId,
    };
    const data = await employeeService.createBranchUser(employeeInfo, entityId);
    res.send(data);
  } catch (e) {
    logger.error('createEmployeeAction', e);
    next(e);
  }
};

const fetchEmployeeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // const { hospitalId, degree, title, speciality, employeeGroup } = req.query;
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    let branchId = get(req.query, 'branchId') || req.companyId;
    const keyword = get(req.query, 'keyword');
    if(!req.isRoot) {
      branchId = req.companyId;
    }
    const data = await employeeService.getEmployeeByBranchId({ branchId, keyword }, options);
    res.send(data);
  } catch (e) {
    logger.error('fetchEmployeeAction', e);
    next(e);
  }
};

const getEmployeeInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const employeeId = get(req.params, 'employeeId');
    const language: string = get(req, 'language');
    let branchId = get(req.query, 'branchId') || req.companyId;
    if(!req.isRoot) {
      branchId = req.companyId;
    }

    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const data = await employeeService.getEmployeeInfo({
      employeeNumber: employeeId,
      branchId: branchId,
    }, raw);
    res.send(data);
  } catch (e) {
    logger.error('getEmployeeInfoAction', e);
    next(e);
  }
};

const updateEmployeeInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      address,
      description,
      gender,
      title,
      degree,
      speciality,
      avatar,
      employeeHistory,
      phoneNumber,
      password,
      employeeGroup,
      certification,
      email,
      groups,
      username,
      branchId,
    } = req.body;
    if (!firstName || !lastName ){
      throw new ValidationFailedError('First name and last name are required.');
    }
    const employeeId = get(req.params, 'employeeId');
    let entityId = branchId || req.companyId;
    if(!req.isRoot) {
      entityId = req.companyId;
    }
    const query: any = {
      employeeNumber: employeeId,
    }
    if(entityId) {
      query.branchId = branchId;
    }
    const employee = await employeeService.getEmployeeInfo(query, true);

    if(!employee) {
      throw new NotFoundError();
    }
    // const user = await userService.findUserById(get(employee, 'userId'));
    // if(username) {
    //   const createdUser = await userService.findUser({username: username, branchId: Number(entityId)});

    //   if(createdUser && createdUser.length > 0 && get(createdUser, '_id') !== get(employee, 'userId') ) {
    //     throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    //   }
    // }

    const employeeInfo: any =  omitBy({
      firstName,
      lastName,
      address,
      description,
      gender,
      title,
      degree,
      speciality,
      avatar,
      employeeHistory,
      phoneNumber,
      password,
      username,
      employeeGroup,
      certification,
      email,
      groups,
      branchId: entityId,
    }, isNil);
    const data = await employeeService.updateEmployeeInfo(query, employeeInfo);
    // if(username || groups) {
    //   await userService.updateUserProfile(get(user, '_id'), omitBy({ username, groups }, isNil));
    //   if(xor(groups, get(user, 'groups'))) {
    //     await employeeService.updateEmployeeGroups(get(user, '_id'), groups, branchId);
    //   }
    // }
    res.send(data);
  } catch (e) {
    logger.error('updateEmployeeInfoAction', e);
    next(e);
  }
};

const deleteEmployeeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      let employeeNumber = get(req.params, 'employeeNumber');
      let branchId = null;
      const query: any = {
        employeeNumber,
      }
      if(!req.isRoot) {
        query.branchId = req.companyId;
      }
      const employee = await employeeService.getEmployeeInfo(query);
      if(!employee) {
        throw new NotFoundError();
      }

      const data = await employeeService.deleteEmployee(Number(employeeNumber));
      res.send(data);
    } catch (e) {
      logger.error('deleteEmployeeAction', e);
      next(e);
    };
}


export default { 
  createEmployeeAction,
  fetchEmployeeAction,
  getEmployeeInfoAction,
  updateEmployeeInfoAction,
  deleteEmployeeAction,
};
