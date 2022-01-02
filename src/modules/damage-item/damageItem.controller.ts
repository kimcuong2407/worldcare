import express from 'express';
import loggerHelper from '@utils/logger.util';
import damageItemService from './damageItem.service';
import {isNil, get} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import appUtil from '@utils/app.util';
import {DamageItemConstants} from '@modules/damage-item/constant';

const logger = loggerHelper.getLogger('damageItem.controller');

const createDamageItem = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const {
      detailItems,
      involvedById,
      involvedBy,
      status,
      note,
      processedAt
    } = req.body;

    const info = {
      detailItems,
      involvedById,
      involvedBy,
      status,
      note,
      processedAt,
      branchId,
      partnerId,
      currentUserId: req.user.id
    }

    const damageItem = await damageItemService.createDamageItem(info);

    const data = await damageItemService.findByQuery({
      _id: damageItem['_id'],
      branchId
    });
    res.send(data);
  } catch (e) {
    logger.error('createDamageItem', e);
    next(e);
  }
};

const updateDamageItem = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const id = req.params.id;
    const damageItem = await damageItemService.getDamageItem({
      _id: id,
      branchId
    })
    if (isNil(damageItem)) {
      throw new ValidationFailedError('Can not find Damage Item.');
    }

    const {
      detailItems,
      involvedById,
      involvedBy,
      status,
      note,
      processedAt
    } = req.body;

    const info = {
      detailItems,
      involvedById,
      involvedBy,
      status,
      note,
      processedAt,
      branchId,
      partnerId,
      currentUserId: req.user.id
    }

    const updatedDamageItem = await damageItemService.updateDamageItem(id, info);
    const data = await damageItemService.findByQuery({
      _id: updatedDamageItem['_id'],
      branchId
    });
    res.send(data);
  } catch (e) {
    logger.error('updateDamageItem', e);
    next(e);
  }
};

const fetchDamageItems = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {keyword, status} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const query: any = {
      keyword,
      status
    }
    const data = await damageItemService.fetchDamageItems(query, options);
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchDamageItems', e);
    next(e);
  }
};

const fetchDamageItemById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const id = req.params.id;

    const data = await damageItemService.findByQuery({
      _id: id,
      branchId
    });
    if (isNil(data)) {
      throw new ValidationFailedError('Can not find Damage Item.');
    }
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchDamageItemById', e);
    next(e);
  }
};

const cancelDamageItemById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const id = req.params.id;
    const damageItem = await damageItemService.getDamageItem({
      _id: id,
      branchId
    })
    if (isNil(damageItem)) {
      throw new ValidationFailedError('Can not find Damage Item');
    }
    if (get(damageItem, '_doc.status') === DamageItemConstants.Status.CANCELED) {
      throw new ValidationFailedError('DamageItem is already canceled.');
    }
    const data = await damageItemService.cancelDamageItem(id);
    res.send(data);
  } catch (e) {
    logger.error('Error while cancelDamageItemById', e);
    next(e);
  }
};

export default {
  create: createDamageItem,
  update: updateDamageItem,
  fetch: fetchDamageItems,
  getById: fetchDamageItemById,
  cancelAction: cancelDamageItemById
};
