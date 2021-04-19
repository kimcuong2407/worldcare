import express from 'express';
import loggerHelper from '@utils/logger.util';
import staffService from './staff.service';
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
import { isNil, omitBy } from 'lodash';

const logger = loggerHelper.getLogger('staff.controller');

const createStaffAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      firstName, lastName, fullName, gender, description,
      phoneNumber, email, hospital, title, degree, speciality, avatar,
      createdBy, updatedBy,
    } = req.body;
    if (!firstName || !lastName ){
      throw new Error('Please verify your input!');
    }
    
    if (!Types.ObjectId.isValid(hospital) || (!(await hospitalService.isHospital(hospital)))) {
      throw new Error('There is no hospitalId');
    }
    // Ignore these validate first
    // if (!Types.ObjectId.isValid(title) || (!(await hospitalService.isHospital(hospital)))) {
    //   throw new Error('There is no hospitalId');
    // }
    // if (!Types.ObjectId.isValid(degree) || (!(await hospitalService.isHospital(hospital)))) {
    //   throw new Error('There is no hospitalId');
    // }
    // if (!Types.ObjectId.isValid(speciality) || (!(await hospitalService.isHospital(hospital)))) {
    //   throw new Error('There is no hospitalId');
    // }

    const staffInfo: any = {
      firstName,
      lastName,
      fullName: fullName || (firstName && lastName ? `${firstName} ${lastName}` : null),
      description,
      gender,
      phoneNumber,
      email,
      hospital: hospital,
      title,
      degree,
      speciality,
      avatar,
      createdBy,
      updatedBy,
    };
    const data = await staffService.createStaff(staffInfo);
    res.send(data);
  } catch (e) {
    logger.error('createStaffAction', e);
    next(e);
  }
};

const fetchStaffAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page, limit,
    }
    const keyword = get(req, 'query.keyword', '');
    const data = await staffService.fetchStaff({keyword, options});
    res.send(data);
  } catch (e) {
    logger.error('fetchStaffInfoAction', e);
    next(e);
  }
};

const fetchStaffInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const staffId = get(req.params, 'staffId');
    const data = await staffService.fetchStaffInfo(staffId);
    res.send(data);
  } catch (e) {
    logger.error('fetchStaffInfoAction', e);
    next(e);
  }
};

const updateStaffInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const staffId = get(req.params, 'staffId');
    const {
      firstName, lastName, fullName, gender, description,
      phoneNumber, email, hospital, title, degree, speciality, avatar,
      createdBy, updatedBy,
    } = req.body;

    const staffInfo: any = omitBy({
      firstName,
      lastName,
      fullName: fullName || (firstName && lastName ? `${firstName} ${lastName}` : null),
      description,
      gender,
      phoneNumber,
      email,
      hospital: hospital,
      title,
      degree,
      speciality,
      avatar,
      createdBy,
      updatedBy,
    }, isNil);
    if(get(staffInfo, 'hospital'))
      if (!Types.ObjectId.isValid(hospital) || (!(await hospitalService.isHospital(hospital)))) {
        throw new Error('There is no hospitalId');
      }
    const params = { staffId, staffInfo };
    const data = await staffService.updateStaffInfo(params);
    res.send(data);
  } catch (e) {
    logger.error('updateStaffInfoAction', e);
    next(e);
  }
};

const deleteStaffAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const staffId = get(req.params, 'staffId');
    const data = await staffService.deleteStaff(staffId);
    res.send(data);
  } catch (e) {
    logger.error('deleteStaffAction', e);
    next(e);
  }
};

export default { 
  createStaffAction,
  fetchStaffAction,
  fetchStaffInfoAction,
  updateStaffInfoAction,
  deleteStaffAction,
};
