import express from 'express';
import loggerHelper from '@utils/logger.util';
import companyService from './company.service';
import slugify from 'slugify';
import { normalizeText } from 'normalize-text';
import get from 'lodash/get';
import lowerCase from 'lodash/lowerCase';
import trim from 'lodash/trim';
import { ENTITY_TYPE, WORKING_HOURS } from './constant';
import appUtil from '@app/utils/app.util';
import { isNil, isString, isUndefined, map, omitBy, pick } from 'lodash';
import { setResponse } from '@app/utils/response.util';
import moment from 'moment';
import authService from '../auth/auth.service';
import employeeService from '../employee/employee.service';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import userService from '../user/user.service';

const logger = loggerHelper.getLogger('company.controller');

const createCompanyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
      companyCode,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      companySettings,
      companyType,
      logo,
      photos,
      slug,
      diseases,
      services,
    } = req.body;
    if (!name || !description ){
      throw new Error('Please verify your input!');
    }
    if (!companyCode ){
      throw new Error('Vui lòng nhập vào companyCode.');
    }

    const existingCompany = await companyService.findCompanyByCode(companyCode);
    if (existingCompany ){
      throw new Error('Company code đã được sử dụng bởi một công ty khác.');
    }
    const companyInfo: any = {
      name,
      description,
      email,
      companyCode,
      phoneNumber,
      speciality,
      address,
      workingHours: workingHours || WORKING_HOURS,
      companySettings,
      companyType,
      logo,
      photos,
      diseases,
      services,
      slug: slug || slugify(trim(lowerCase(normalizeText(
        isString(name) ? name : get(name, 'vi', ''))))),
    };
    const data = await companyService.createCompany(companyInfo);
    await authService.setupDefaultRoles(get(data, '_id'));
    res.send(data);
  } catch (e) {
    logger.error('createCompanyAction', e);
    next(e);
  }
};

const fetchCompanyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page, limit,
    }
    const specialityId: string = get(req.query, 'specialityId');
    const city: string = get(req.query, 'city');
    const companyId: string = get(req.query, 'companyId');
    const companyType: string = get(req.query, 'companyType');
    
    const language: string = get(req, 'language');
    const keyword = get(req, 'query.keyword', '');
    const data = await companyService.fetchCompany({specialityId, keyword, options, city, companyId, companyType}, language);
    res.send(data);
  } catch (e) {
    logger.error('fetchCompanyInfoAction', e);
    next(e);
  }
};

const fetchCompanyInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyIdOrSlug = get(req.params, 'companyId');
    const language: string = get(req, 'language');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const data = await companyService.fetchCompanyInfo(companyIdOrSlug, language, raw);
    res.send(data);
  } catch (e) {
    logger.error('fetchCompanyInfoAction', e);
    next(e);
  }
};

const updateCompanyInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyId = get(req.params, 'companyId');
    const {
      name,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      companySettings,
      logo,
      photos,
      slug,
      diseases,
      services,
    } = req.body;
    const companyInfo: any = omitBy({
      name,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      companySettings,
      logo,
      photos,
      diseases,
      services,
      slug: slug ? slugify(trim(lowerCase(normalizeText(slug)))) : null,
    }, isNil);
    const params = { companyId, companyInfo };
    const data = await companyService.updateCompanyInfo(params);
    res.send(data);
  } catch (e) {
    logger.error('updateCompanyInfoAction', e);
    next(e);
  }
};

const deleteCompanyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyId = get(req.params, 'companyId');
    const data = await companyService.deleteCompany(companyId);
    res.send(data);
  } catch (e) {
    logger.error('deleteCompanyAction', e);
    next(e);
  }
};

const getSimillarCompanyInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyIdOrSlug = get(req.params, 'companyId');
    const language: string = get(req, 'language');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const data = await companyService.getSimillarCompany(companyIdOrSlug, language, raw);
    res.send(data);
  } catch (e) {
    logger.error('fetchCompanyInfoAction', e);
    next(e);
  }
};


const getAvailableCompanySlotAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyIdOrSlug = get(req.params, 'companyId');
    const startTime = moment().valueOf();
    const endTime = moment().add(14, 'days').endOf('day').valueOf();
    const data = await companyService.getAvailableCompanySlot(companyIdOrSlug, startTime, endTime);
    res.send(data);
  } catch (e) {
    logger.error('getAvailableCompanySlotAction', e);
    next(e);
  }
};


const createCompanyUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyId = get(req.params, 'companyId');

    const {
      firstName, lastName, username,
    } = req.body;
    if (!firstName || !lastName ){
      throw new ValidationFailedError('First name and last name are required.');
    }

    const createdUser = await userService.findUser({username: username, companyId: companyId || null});
    if(createdUser && createdUser.length > 0) {
      throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    }
    const data = await companyService.createCompanyUser(req.body, companyId);
    res.send(data);
  } catch (e) {
    logger.error('createCompanyUserAction', e);
    next(e);
  }
};

const getCompanyGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyIdOrSlug = get(req.params, 'companyId');
    const roles = await authService.getRolesByCompany(companyIdOrSlug);
    res.send(roles);
  } catch (e) {
    logger.error('getCompanyGroupAction', e);
    next(e);
  }
};

const getCompanyGroupDetailAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyIdOrSlug = get(req.params, 'companyId');
    const groupId = get(req.params, 'groupId');
    const roles = await authService.getRolesDetailByCompanyAndId(companyIdOrSlug, groupId);
    res.send(roles);
  } catch (e) {
    logger.error('getCompanyGroupDetailAction', e);
    next(e);
  }
};


const getCompanyByCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyType = get(req.params, 'companyType');
    const keyword = get(req.query, 'keyword');
    const language: string = get(req, 'language');

    const companies = await companyService.fetchCompanyByType(companyType, keyword, language);
    res.send(map(companies, (comp) => pick(comp, ['address', 'companyId', 'name'])));
  } catch (e) {
    logger.error('getCompanyGroupAction', e);
    next(e);
  }
};

const getCompanyUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const options = appUtil.getPaging(req);
    const companyId = get(req.params, 'companyId');
    const keyword = get(req.query, 'keyword');
    const language: string = get(req, 'language');

    const users = await companyService.getCompanyUsers(companyId, options);
    res.send(users);
  } catch (e) {
    logger.error('getCompanyGroupAction', e);
    next(e);
  }
};

export default { 
  createCompanyAction,
  fetchCompanyAction,
  fetchCompanyInfoAction,
  updateCompanyInfoAction,
  deleteCompanyAction,
  getSimillarCompanyInfoAction,
  getAvailableCompanySlotAction,
  createCompanyUserAction,
  getCompanyUserAction,
  getCompanyGroupAction,
  getCompanyByCategoryAction,
  getCompanyGroupDetailAction,
};
