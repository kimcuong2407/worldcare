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
import { isNil, isString, isUndefined, omitBy } from 'lodash';
import { setResponse } from '@app/utils/response.util';

const logger = loggerHelper.getLogger('hospital.controller');

const createHospitalAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      hospitalName, description, email, phoneNumber,
      speciality, address, workingHours, hospitalSettings, logo, photos, slug,
      diseases,
      services,
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
      diseases,
      services,
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
    const specialityId: string = get(req.query, 'specialityId');
    const city: string = get(req.query, 'city');
    const hospitalId: string = get(req.query, 'hospitalId');
    const language: string = get(req, 'language');
    const keyword = get(req, 'query.keyword', '');
    const data = await hospitalService.fetchHospital({specialityId, keyword, options, city, hospitalId}, language);
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
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
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
      diseases,
      services,
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
      diseases,
      services,
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
