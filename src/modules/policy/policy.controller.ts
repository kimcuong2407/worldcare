import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import policyService from './policy.service';
import { isNil, isUndefined, lowerCase, map, omit, omitBy, trim } from 'lodash';
import { Types } from 'mongoose';
import userService from '../user/user.service';
import hospitalService from '../hospital/hospital.service';
import appUtil from '@app/utils/app.util';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import slugify from 'slugify';
import normalizeText from 'normalize-text';

const logger = loggerHelper.getLogger('policy.controller');

const createPolicyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      title,
      content,
      index,
    } = req.body;
    if (!title) {
      throw new ValidationFailedError('Title is required.');
    }
    if (!content) {
      throw new ValidationFailedError('Content is required.');
    }

    const policy = await policyService.createPolicy({
      title,
      content,
      index,
    });
    res.send(policy);
  } catch (e) {
    logger.error('createPolicyAction', e);
    next(e);
  }
};


const updatePolicyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const policyId = get(req.params, 'id');
    const {
      title,
      content,
      index,
    } = req.body;
    if (!title) {
      throw new ValidationFailedError('Title is required.');
    }
    if (!content) {
      throw new ValidationFailedError('Content is required.');
    }

    const policy = await policyService.updatePolicyById(policyId, omitBy({
      title,
      content,
      index,
    }, isNil));

    res.send(policy);
  } catch (e) {
    logger.error('updatePolicyAction', e);
    next(e);
  }
};


const fetchPolicyAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const keyword = get(req, 'query.keyword', '');
    const language: string = get(req, 'language');
    const policys = await policyService.getPolicy(language, raw);
    res.send(policys);
  } catch (e) {
    logger.error('createPolicyAction', e);
    next(e);
  }
};


const getPolicyByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const policyId = get(req.params, 'id');
    const language: string = get(req, 'language');

    const raw: boolean = !isUndefined(get(req.query, 'raw'));

    const policy = await policyService.getPolicyById(policyId, language, raw);
    res.send(policy);
  } catch (e) {
    logger.error('getPolicyByIdOrSlugAction', e);
    next(e);
  }
};


const deletePolicyByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const policyId = get(req.params, 'id');

    const policy = await policyService.deletePolicy(policyId);
    res.send(policy);
  } catch (e) {
    logger.error('deletePolicyByIdAction', e);
    next(e);
  }
};

export default {
  createPolicyAction,
  deletePolicyByIdAction,
  fetchPolicyAction,
  getPolicyByIdOrSlugAction,
  updatePolicyAction,
}