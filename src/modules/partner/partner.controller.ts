import express from 'express';
import loggerHelper from '@utils/logger.util';
import partnerService from './partner.service';
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

const logger = loggerHelper.getLogger('partner.controller');

const createPartnerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
      partnerCode,
      email,
      phoneNumber,
      address,
      partnerType,
      logo,
      photos,
      modules,
    } = req.body;
    if (!name || !description ){
      throw new ValidationFailedError('Vui lòng nhập vào tên và mô tả.');
    }
    if (!partnerCode ){
      throw new ValidationFailedError('Vui lòng nhập vào partnerCode.');
    }

    const existingPartner = await partnerService.findPartnerByCode(partnerCode);
    if (existingPartner ){
      throw new ValidationFailedError('Partner code đã được sử dụng bởi một công ty khác.');
    }
    const partnerInfo: any = {
      name,
      description,
      email,
      partnerCode,
      phoneNumber,
      address,
      partnerType,
      logo,
      photos,
      modules,
    };
    const data = await partnerService.createPartner(partnerInfo);
    res.send(data);
  } catch (e) {
    logger.error('createPartnerAction', e);
    next(e);
  }
};

const fetchPartnerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page, limit,
    }
    const modules: string = get(req.query, 'modules');
    const cityId: string = get(req.query, 'cityId');
    const partnerId: string = get(req.query, 'partnerId');
    const keyword = get(req, 'query.keyword', '');
    const sortBy = get(req, 'query.sortBy', '');
    const sortDirection = get(req, 'query.sortDirection', '');
    
    const data = await partnerService.fetchPartner({
      modules: modules ? String(modules || '').split(',')  : [], keyword, cityId,
      partnerId,
      sortBy,
      sortDirection,
    }, options);
    res.send(data);
  } catch (e) {
    logger.error('fetchPartnerInfoAction', e);
    next(e);
  }
};

const fetchPartnerInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = get(req.params, 'partnerId');
    const data = await partnerService.fetchPartnerInfo(partnerId);
    res.send(data);
  } catch (e) {
    logger.error('fetchPartnerInfoAction', e);
    next(e);
  }
};

const updatePartnerInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = get(req.params, 'partnerId');
    const {
      name,
      description,
      email,
      partnerCode,
      phoneNumber,
      address,
      partnerType,
      logo,
      photos,
      modules,
    } = req.body;
    const partnerInfo: any = omitBy({
      name,
      description,
      email,
      partnerCode,
      phoneNumber,
      address,
      partnerType,
      logo,
      photos,
      modules,
    }, isNil);
    if(partnerCode) {
      const existingPartner = await partnerService.findPartnerByCode(partnerCode);
      if (existingPartner && get(existingPartner, '_id') !== Number(partnerId)){
        throw new ValidationFailedError('Partner code đã được sử dụng bởi một công ty khác.');
      }
    }
    const data = await partnerService.updatePartnerInfo(partnerId, partnerInfo);
    res.send(data);
  } catch (e) {
    logger.error('updatePartnerInfoAction', e);
    next(e);
  }
};

const deletePartnerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = get(req.params, 'partnerId');
    const data = await partnerService.deletePartner(partnerId);
    res.send(data);
  } catch (e) {
    logger.error('deletePartnerAction', e);
    next(e);
  }
};

const fetchPartnerBranchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = get(req.params, 'partnerId');
    const data = await partnerService.fetchPartnerBranch(partnerId);
    res.send(data);
  } catch (e) {
    logger.error('fetchPartnerBranchAction', e);
    next(e);
  }
};


const createPartnerUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = get(req.params, 'partnerId');

    const {
      firstName, lastName, username,
    } = req.body;
    if (!firstName || !lastName ){
      throw new ValidationFailedError('First name and last name are required.');
    }

    const createdUser = await userService.findUser({username: username, partnerId: partnerId || null});
    if(createdUser && createdUser.length > 0) {
      throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    }
    const data = await partnerService.createPartnerUser(req.body, partnerId);
    res.send(data);
  } catch (e) {
    logger.error('createPartnerUserAction', e);
    next(e);
  }
};

const getPartnerGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerIdOrSlug = get(req.params, 'partnerId');
    const roles = await authService.getRolesByPartner(partnerIdOrSlug);
    res.send(roles);
  } catch (e) {
    logger.error('getPartnerGroupAction', e);
    next(e);
  }
};

const getPartnerGroupDetailAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerIdOrSlug = get(req.params, 'partnerId');
    const groupId = get(req.params, 'groupId');
    const roles = await authService.getRolesDetailByPartnerAndId(partnerIdOrSlug, groupId);
    res.send(roles);
  } catch (e) {
    logger.error('getPartnerGroupDetailAction', e);
    next(e);
  }
};


const getPartnerByCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerType = get(req.params, 'partnerType');
    const keyword = get(req.query, 'keyword');
    const language: string = get(req, 'language');

    const companies = await partnerService.fetchPartnerByType(partnerType, keyword, language);
    res.send(map(companies, (comp) => pick(comp, ['address', 'partnerId', 'name'])));
  } catch (e) {
    logger.error('getPartnerGroupAction', e);
    next(e);
  }
};

const getPartnerUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const options = appUtil.getPaging(req);
    const partnerId = get(req.params, 'partnerId');
    const keyword = get(req.query, 'keyword');
    const language: string = get(req, 'language');

    const users = await partnerService.getPartnerUsers(Number(partnerId), options);
    res.send(users);
  } catch (e) {
    logger.error('getPartnerGroupAction', e);
    next(e);
  }
};

export default { 
  createPartnerAction,
  fetchPartnerAction,
  fetchPartnerInfoAction,
  updatePartnerInfoAction,
  deletePartnerAction,
  fetchPartnerBranchAction,
  createPartnerUserAction,
  getPartnerUserAction,
  getPartnerGroupAction,
  getPartnerGroupDetailAction,
};
