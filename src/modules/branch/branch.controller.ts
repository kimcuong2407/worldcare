import express from 'express';
import loggerHelper from '@utils/logger.util';
import branchService from './branch.service';
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
import partnerService from '../partner/partner.service';

const logger = loggerHelper.getLogger('branch.controller');

const createBranchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
      branchCode,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      branchSettings,
      branchType,
      logo,
      photos,
      slug,
      diseases,
      services,
      partnerId,
      parentId,
    } = req.body;
    if (!name || !description) {
      throw new Error('Please verify your input!');
    }

    let partnerIdentity = partnerId;

    if(!req.isRoot) {
      partnerIdentity = null;
    }

    if(!partnerIdentity) {
      const currentBranch = await branchService.findBranchById(Number(req.companyId));
      partnerIdentity = get(currentBranch, 'partnerId');
    }

    const generatedNamedSlug = `${get(name, 'vi', '')}-${get(address, 'street')}`;
    const branchInfo: any = {
      name,
      description,
      email,
      branchCode,
      phoneNumber,
      speciality,
      address,
      workingHours: workingHours || WORKING_HOURS,
      branchSettings,
      branchType,
      logo,
      photos,
      diseases,
      services,
      parentId,
      partnerId: partnerIdentity,
      slug: slugify(trim(lowerCase(normalizeText(isString(name) ? name : generatedNamedSlug)))),
    };
    const partner = await partnerService.findPartnerById(partnerIdentity);
    const data = await branchService.createBranch({
      ...branchInfo,
      branchType: get(partner, 'modules'),
    });
    await authService.setupDefaultRoles(get(data, '_id'));
    res.send(data);
  } catch (e) {
    logger.error('createBranchAction', e);
    next(e);
  }
};

const fetchBranchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page, limit,
    }
    const specialityId: string = get(req.query, 'specialityId');
    const cityId: string = get(req.query, 'cityId');
    const branchType: string = get(req.query, 'branchType');
    let partnerId: string = get(req.query, 'partnerId');
    let branchId: string = null;

    if(!req.isRoot) {
      branchId = req.companyId;
    }
    
    const language: string = get(req, 'language');
    const keyword = get(req, 'query.keyword', '');
    const data = await branchService.findBranchAndChild(partnerId, branchId, omitBy({
      specialityId,
      'address.cityId': cityId,
    }, isNil));
    res.send(data);
  } catch (e) {
    logger.error('fetchBranchAction', e);
    next(e);
  }
};

const fetchBranchInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchIdOrSlug = get(req.params, 'branchId');
    const language: string = get(req, 'language');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const data = await branchService.fetchBranchInfo(branchIdOrSlug, language, raw);
    res.send(data);
  } catch (e) {
    logger.error('fetchBranchInfoAction', e);
    next(e);
  }
};

const updateBranchInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = get(req.params, 'branchId');
    const {
      name,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      branchSettings,
      logo,
      photos,
      slug,
      diseases,
      services,
      parentId,
    } = req.body;
    const branchInfo: any = omitBy({
      name,
      description,
      email,
      phoneNumber,
      speciality,
      address,
      workingHours,
      branchSettings,
      logo,
      photos,
      diseases,
      services,
      parentId,
      slug: slug ? slugify(trim(lowerCase(normalizeText(slug)))) : null,
    }, isNil);

    if(slug) {
      const existingSlug = await branchService.findBranchBySlug(slug);
      if(existingSlug) {
        throw new ValidationFailedError('Đường dẫn đã tồn tại, vui lòng chọn tên đường dẫn khác.');
      }
    }

    // const params = { branchId, branchInfo };
    const data = await branchService.updateBranchInfo(Number(branchId), branchInfo);
    res.send(data);
  } catch (e) {
    logger.error('updateBranchInfoAction', e);
    next(e);
  }
};

const deleteBranchAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = get(req.params, 'branchId');
    const data = await branchService.deleteBranch(branchId);
    res.send(data);
  } catch (e) {
    logger.error('deleteBranchAction', e);
    next(e);
  }
};

const getSimillarBranchInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchIdOrSlug = get(req.params, 'branchId');
    const language: string = get(req, 'language');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const data = await branchService.getSimillarBranch(branchIdOrSlug, language, raw);
    res.send(data);
  } catch (e) {
    logger.error('fetchBranchInfoAction', e);
    next(e);
  }
};


const getAvailableBranchSlotAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchIdOrSlug = get(req.params, 'branchId');
    const startTime = moment().valueOf();
    const endTime = moment().add(14, 'days').endOf('day').valueOf();
    const data = await branchService.getAvailableBranchSlot(branchIdOrSlug, startTime, endTime);
    res.send(data);
  } catch (e) {
    logger.error('getAvailableBranchSlotAction', e);
    next(e);
  }
};


const createBranchUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = get(req.params, 'branchId');

    const {
      firstName, lastName, username,
    } = req.body;
    if (!firstName || !lastName ){
      throw new ValidationFailedError('First name and last name are required.');
    }

    const createdUser = await userService.findUser({username: username, branchId: branchId || null});
    if(createdUser && createdUser.length > 0) {
      throw new ValidationFailedError('Tên đăng nhập đã tồn tại.');
    }
    const data = await branchService.createBranchUser(req.body, branchId);
    res.send(data);
  } catch (e) {
    logger.error('createBranchUserAction', e);
    next(e);
  }
};

const getBranchGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchIdOrSlug = get(req.params, 'branchId');
    const roles = await authService.getRolesByBranch(branchIdOrSlug);
    res.send(roles);
  } catch (e) {
    logger.error('getBranchGroupAction', e);
    next(e);
  }
};

const getBranchGroupDetailAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchIdOrSlug = get(req.params, 'branchId');
    const groupId = get(req.params, 'groupId');
    const roles = await authService.getRolesDetailByBranchAndId(branchIdOrSlug, groupId);
    res.send(roles);
  } catch (e) {
    logger.error('getBranchGroupDetailAction', e);
    next(e);
  }
};


const getBranchByCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchType = get(req.params, 'branchType');
    const keyword = get(req.query, 'keyword');
    const language: string = get(req, 'language');

    const companies = await branchService.fetchBranchByType(branchType, keyword, language);
    res.send(map(companies, (comp) => {
      const { _id, ...rest } = comp;
      return {
        companyId: _id,
        ...pick(rest, ['address', 'branchId', 'name', '_id']),
      }
    }));
  } catch (e) {
    logger.error('getBranchGroupAction', e);
    next(e);
  }
};

const getBranchUserAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const options = appUtil.getPaging(req);
    let branchId = get(req.query, 'branchId');
    const keyword = get(req.query, 'keyword');
    if(!req.isRoot) {
      branchId = req.companyId;
    }
    const users = await branchService.getBranchUsers(Number(branchId), options);
    res.send(users);
  } catch (e) {
    logger.error('getBranchGroupAction', e);
    next(e);
  }
};

export default { 
  createBranchAction,
  fetchBranchAction,
  fetchBranchInfoAction,
  updateBranchInfoAction,
  deleteBranchAction,
  getSimillarBranchInfoAction,
  getAvailableBranchSlotAction,
  createBranchUserAction,
  getBranchUserAction,
  getBranchGroupAction,
  getBranchByCategoryAction,
  getBranchGroupDetailAction,
};
