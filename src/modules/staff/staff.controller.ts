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
import configurationService from '@app/modules/configuration/configuration.service';
import { isNil, map, omitBy } from 'lodash';

const logger = loggerHelper.getLogger('staff.controller');

const createStaffAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      firstName, lastName, fullName, gender, description,
      phoneNumber, email, hospitalId, title, degree, speciality, employeeGroup,
      avatar, employeeHistory, certification, slug, lang
    } = req.body;
    if (!firstName || !lastName ){
      throw new Error('Please verify your input!');
    }
    
    if (hospitalId && (!Types.ObjectId.isValid(hospitalId) || (!(await hospitalService.isHospital(hospitalId))))) {
      throw new Error('There is no hospitalId');
    }
    title && map(title, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getTitleById(id))))) {
        throw new Error('There is no titleId');
      }
    });
    degree && map(degree, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getDegreeById(id))))) {
        throw new Error('There is no degreeId');
      }
    });
    speciality && map(speciality, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getSpecialityById(id))))) {
        throw new Error('There is no sepcialityId');
      }
    });
    if(employeeGroup && (!Types.ObjectId.isValid(employeeGroup) || (!(await configurationService.getEmployeeGroupById(employeeGroup))))) {
      throw new Error('There is no employeeGroupId');
    }

    const staffInfo: any = {
      firstName,
      lastName,
      fullName: fullName || (firstName && lastName ? `${firstName} ${lastName}` : null),
      description,
      gender,
      phoneNumber,
      email,
      hospital: hospitalId,
      title: title || [],
      degree: degree || [],
      speciality: speciality || [],
      employeeGroup,
      avatar,
      employeeHistory,
      certification,
      lang,
      slug: slug || slugify(trim(lowerCase(normalizeText(`${firstName}-${lastName}-${new Date().getTime()}`))))
      // createdBy,
      // updatedBy,
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
    const { hospitalId, degree, title, speciality } = req.query;
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
      hospitalId,
      degree,
      title,
      speciality,
    }
    const keyword = get(req, 'query.keyword', '');
    const data = await staffService.fetchStaff({keyword, options});
    res.send(data);
  } catch (e) {
    logger.error('fetchStaffAction', e);
    next(e);
  }
};

const fetchStaffInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const staffId = get(req.params, 'staffId');
    const raw: string = get(req.query, 'raw');
    const data = await staffService.fetchStaffInfo(staffId, raw);
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
      phoneNumber, email, hospital, title, degree, speciality, employeeGroup,
      avatar,
    } = req.body;

    if (hospital && (!Types.ObjectId.isValid(hospital) || (!(await hospitalService.isHospital(hospital))))) {
      throw new Error('There is no hospitalId');
    }
    map(title, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getTitleById(id))))) {
        throw new Error('There is no titleId');
      }
    });
    map(degree, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getDegreeById(id))))) {
        throw new Error('There is no degreeId');
      }
    });
    map(speciality, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await configurationService.getSpecialityById(id))))) {
        throw new Error('There is no sepcialityId');
      }
    });
    if(employeeGroup && (!Types.ObjectId.isValid(employeeGroup) || (!(await configurationService.getEmployeeTypeById(employeeGroup))))) {
      throw new Error('There is no employeeGroupId');
    }
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
      employeeGroup,
      avatar,
      createdBy,
      updatedBy,
    }, isNil);
  
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
