import express from 'express';
import loggerHelper from '@utils/logger.util';
import hospitalService from './hospital.service';
import slugify from 'slugify';
import { normalizeText } from 'normalize-text';
import get from 'lodash/get';
import lowerCase from 'lodash/lowerCase';
import trim from 'lodash/trim';
import { WORKING_HOURS } from './constant';
import appUtil from '@app/utils/app.util';
import { isNil, isString, omitBy } from 'lodash';

const logger = loggerHelper.getLogger('hospital.controller');

const createHospitalAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      hospitalName, description, email, phoneNumber,
      speciality, address, workingHours, hospitalSettings, logo, photos, slug,
    } = req.body;
    if (!hospitalName || !description ){
      throw new Error('Please verify your input!');
    }
    const hospitalInfo: any = {
      hospitalName,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours: workingHours || WORKING_HOURS,
      hospitalSettings,
      logo,
      photos,
      slug: slug || slugify(trim(lowerCase(normalizeText(
        isString(hospitalName) ? hospitalName : get(hospitalName, 'vi', ''))))),
    };
    const data = await hospitalService.createHospital(hospitalInfo);
    res.send(data);
  } catch (e) {
    logger.error('createHospitalAction', e);
    next(e);
  }
};

const fetchHospitalAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page, limit,
    }
    const language: string = get(req, 'language');
    const keyword = get(req, 'query.keyword', '');
    const data = await hospitalService.fetchHospital({keyword, options}, language);
    res.send(data);
  } catch (e) {
    logger.error('fetchHospitalInfoAction', e);
    next(e);
  }
};

const fetchHospitalInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const hospitalIdOrSlug = get(req.params, 'hospitalId');
    const language: string = get(req, 'language');
    const raw: string = get(req.query, 'raw');

    const data = await hospitalService.fetchHospitalInfo(hospitalIdOrSlug, language, raw);
    res.send(data);
  } catch (e) {
    logger.error('fetchHospitalInfoAction', e);
    next(e);
  }
};

const updateHospitalInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const hospitalId = get(req.params, 'hospitalId');
    const {
      hospitalName, description, email, phoneNumber,
      speciality, address, workingHours, hospitalSettings, logo, photos, slug,
    } = req.body;
    const hospitalInfo: any = omitBy({
      hospitalName,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      hospitalSettings,
      logo,
      photos,
      slug: slug ? slugify(trim(lowerCase(normalizeText(slug)))) : null,
    }, isNil);
    const params = { hospitalId, hospitalInfo };
    const data = await hospitalService.updateHospitalInfo(params);
    res.send(data);
  } catch (e) {
    logger.error('updateHospitalInfoAction', e);
    next(e);
  }
};

const deleteHospitalAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const hospitalId = get(req.params, 'hospitalId');
    const data = await hospitalService.deleteHospital(hospitalId);
    res.send(data);
  } catch (e) {
    logger.error('deleteHospitalAction', e);
    next(e);
  }
};

export default { 
  createHospitalAction,
  fetchHospitalAction,
  fetchHospitalInfoAction,
  updateHospitalInfoAction,
  deleteHospitalAction,
};
