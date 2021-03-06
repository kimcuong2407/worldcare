import express from 'express';
import loggerHelper from '@utils/logger.util';
import { PRODUCT_GROUP_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import productGroupService from './productGroup.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('productGroup.controller');

const validateProductGroup = async (info: any, id?: String) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const query = isNil(id) ? { name, status: { $ne: PRODUCT_GROUP_STATUS.DELETED } } : { _id: { $ne: id }, name, status: { $ne: PRODUCT_GROUP_STATUS.DELETED } };
  const data = await productGroupService.getProductGroupInfo(query);
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(`Product Group with ${name} is already existed.`);
  }

  const status = get(info, 'status', PRODUCT_GROUP_STATUS.ACTIVE);
  if(!Object.values(PRODUCT_GROUP_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }

  const superGroupId = get(info, 'superGroupId', null);
  if (superGroupId === id) {
    throw new ValidationFailedError('SuperGroupId must be different with the update one.');
  }
  const isSuperGroupIdExist = await productGroupService.getProductGroupInfo({_id: superGroupId});
  if (isNil(isSuperGroupIdExist)) {
    throw new ValidationFailedError('SuperGroupId must be exist.');
  }
};

const createProductGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const { name, superGroupId, description, status } = req.body;
    const info = {
      name,
      superGroupId,
      description,
      status: status || PRODUCT_GROUP_STATUS.ACTIVE,
      branchId,
    };
    await validateProductGroup(info);
    if (!name) {
      throw new ValidationFailedError('Name is required.');
    }

    const productGroup = await productGroupService.createProductGroup(info);
    res.send(productGroup);
  } catch (error) {
    logger.error('createProductGroupAction', error);
    next(error);
  }
};

const fetchProductGroupListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const query = { branchId, status: { $ne: PRODUCT_GROUP_STATUS.DELETED } };
    const list = await productGroupService.getProductGroupList(
      query,
      language,
      raw
    );
    res.send(list);
  } catch (error) {
    logger.error('fetchProductGroupAction', error);
    next(error);
  }
};

const fetchProductGroupInfoAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const id = get(req.params, 'id');
    if (isNil(id)) {
      throw new ValidationFailedError('id is required.');
    }
    const query = { _id: id, branchId };
    const productGroup = await productGroupService.getProductGroupInfo(
      query,
      language,
      raw
    );
    res.send(productGroup);
  } catch (error) {
    logger.error('fetchProductGroupInfoAction', error);
    next(error);
  }
}

const updateProductGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req.params, 'id');
    const { name, superGroupId, description, status } = req.body;
    const info = {
      name,
      superGroupId,
      description,
      status: status,
    }
    await validateProductGroup(info, id);

    const productGroup = await productGroupService.updateProductGroup(
      { _id: id, branchId },
      omitBy(info, isNil)
    );
    res.send(productGroup);
  } catch (error) {
    logger.error('updateProductGroupAction', error);
    next(error);
  }
};

const deleteProductGroupByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req.params, 'id');
    const productGroup = await productGroupService.deleteProductGroup(
      { _id: id, branchId }
    );
    res.send(productGroup);
  } catch (error) {
    logger.error('deleteProductGroupByIdAction', error);
    next(error);
  }
};

export default {
  createProductGroupAction,
  fetchProductGroupListAction,
  fetchProductGroupInfoAction,
  updateProductGroupAction,
  deleteProductGroupByIdAction,
};
