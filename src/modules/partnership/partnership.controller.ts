import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import partnershipService from './partnership.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import appUtil from '@app/utils/app.util';
import jwtUtil from '@app/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { xor } from 'lodash';

const logger = loggerHelper.getLogger('partnership.controller');

const fetchPartnershipAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const keyword = get(req.query, 'keyword');

    const partnerships = await partnershipService.fetchPartnership({ keyword }, options)
    res.send(partnerships);
  } catch (e) {
    logger.error('fetchPartnershipAction', e);
    next(e);
  }
}

const createPartnershipAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      name,
      logo,
      description,
      address,
      slug,
      email,
      phoneNumber,

    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Vui lòng nhập vào tên partnership.');
    }

    const createdPartnership = await partnershipService.createPartnership(
      {
        name,
        logo,
        description,
        address,
        slug,
        email,
        phoneNumber,
      }
    );
    res.send(setResponse(createdPartnership, true, 'Tài khoản đã được tạo thành công.'));
  } catch (e) {
    logger.error('createPartnershipAction', e);
    next(e);
  }
}

const updatePartnershipAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      name,
      logo,
      description,
      address,
      slug,
      email,
      phoneNumber,
    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Vui lòng nhập vào tên partnership.');
    }

    const updatedPartnership = await partnershipService.updatePartnership(
      get(req.params, 'partnershipId'),
      {
        name,
        logo,
        description,
        address,
        slug,
        email,
        phoneNumber,
      }
    );
    res.send(setResponse(updatedPartnership, true, 'Partnership đã được tạo thành công.'));
  } catch (e) {
    logger.error('updatePartnershipAction', e);
    next(e);
  }
}

const getPartnershipDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let partnershipId = get(req.params, 'partnershipId');

    const partnership: any = await partnershipService.getPartnershipInfo(partnershipId);

    res.send(setResponse(partnership, true));
  } catch (e) {
    logger.error('getPartnershipDetailAction', e);
    next(e);
  }
}


const deletePartnershipAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let partnershipId = get(req.params, 'partnershipId');

    await partnershipService.deletePartnership(partnershipId)
    res.send(setResponse({}, true, 'Partnership đã được xóa thành công.'));
  } catch (e) {
    logger.error('deletePartnershipAction', e);
    next(e);
  }
}


export default {
  fetchPartnershipAction,
  createPartnershipAction,
  updatePartnershipAction,
  getPartnershipDetailAction,
  deletePartnershipAction,
};
