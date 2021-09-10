import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import shippingVendorService from './shipping-vendor.service';
import { isNil, isUndefined, lowerCase, map, omit, omitBy, trim } from 'lodash';
import { Types } from 'mongoose';
import userService from '../user/user.service';
import hospitalService from '../hospital/hospital.service';
import appUtil from '@app/utils/app.util';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import slugify from 'slugify';
import normalizeText from 'normalize-text';

const logger = loggerHelper.getLogger('shipping-vendor.controller');

const createShippingVendorAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
    } = req.body;
    if (!name) {
      throw new ValidationFailedError('Name is required.');
    }
    if (!description) {
      throw new ValidationFailedError('Description is required.');
    }

    const shippingVendor = await shippingVendorService.createShippingVendor({
      name,
      description,
    });
    res.send(shippingVendor);
  } catch (e) {
    logger.error('createShippingVendorAction', e);
    next(e);
  }
};


const updateShippingVendorAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const shippingVendorId = get(req.params, 'id');
    const {
      name,
      description,
    } = req.body;
    if (!name) {
      throw new ValidationFailedError('Name is required.');
    }
    if (!description) {
      throw new ValidationFailedError('Description is required.');
    }

    const shippingVendor = await shippingVendorService.updateShippingVendorById(shippingVendorId, omitBy({
      name,
      description,
    }, isNil));

    res.send(shippingVendor);
  } catch (e) {
    logger.error('updateShippingVendorAction', e);
    next(e);
  }
};


const fetchShippingVendorAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const keyword = get(req, 'query.keyword', '');
    const language: string = get(req, 'language');
    const shippingVendors = await shippingVendorService.getShippingVendor(language, raw);
    res.send(shippingVendors);
  } catch (e) {
    logger.error('createShippingVendorAction', e);
    next(e);
  }
};


const getShippingVendorByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const shippingVendorId = get(req.params, 'id');
    const language: string = get(req, 'language');

    const raw: boolean = !isUndefined(get(req.query, 'raw'));

    const shippingVendor = await shippingVendorService.getShippingVendorById(shippingVendorId, language, raw);
    res.send(shippingVendor);
  } catch (e) {
    logger.error('getShippingVendorByIdOrSlugAction', e);
    next(e);
  }
};


const deleteShippingVendorByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const shippingVendorId = get(req.params, 'id');

    const shippingVendor = await shippingVendorService.deleteShippingVendor(shippingVendorId);
    res.send(shippingVendor);
  } catch (e) {
    logger.error('deleteShippingVendorByIdAction', e);
    next(e);
  }
};

export default {
  createShippingVendorAction,
  deleteShippingVendorByIdAction,
  fetchShippingVendorAction,
  getShippingVendorByIdOrSlugAction,
  updateShippingVendorAction,
}