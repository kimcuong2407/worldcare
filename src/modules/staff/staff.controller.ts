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
import { WORKING_HOURS } from './constant';
import appUtil from '@app/utils/app.util';

const logger = loggerHelper.getLogger('staff.controller');

const createStaffAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      staffName, description, email, phoneNumber,
      speciality, address, workingHours, staffSettings, logo, photos, slug,
    } = req.body;
    if (!staffName || !description ){
      throw new Error('Please verify your input!');
    }
    const staffInfo: any = {
      staffName,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours: workingHours || WORKING_HOURS,
      staffSettings,
      logo,
      photos,
      slug: slug || slugify(trim(lowerCase(normalizeText(staffName)))),
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
      staffName, description, email, phoneNumber,
      speciality, address, workingHours, staffSettings, logo, photos, slug,
    } = req.body;
    const staffInfo: any = pickBy({
      staffName,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      staffSettings,
      logo,
      photos,
      slug: slug ? slugify(trim(lowerCase(normalizeText(slug)))) : null,
    }, identity);
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
