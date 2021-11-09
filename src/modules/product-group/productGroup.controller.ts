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
  console.log(isNil(id), id)
  if (isNil(id)) {
    if (isNil(name)) {
      throw new ValidationFailedError('Name is required.');
    }
  }
  
  const data = await productGroupService.getProductGroupInfo({name});
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
    const { name, superGroupId, description, status } = req.body;
    const info = {
      name,
      superGroupId,
      description,
      status: status || PRODUCT_GROUP_STATUS.ACTIVE,
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

const fetchProductGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const productGroup = await productGroupService.getProductGroup(
      language,
      raw
    );
    res.send(productGroup);
  } catch (error) {
    logger.error('fetchProductGroupAction', error);
    next(error);
  }
};

const updateProductGroupAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const { name, superGroupId, description, status } = req.body;
    const info = {
      name,
      superGroupId,
      description,
      status: status || PRODUCT_GROUP_STATUS.ACTIVE,
    }
    await validateProductGroup(info, id);

    const productGroup = await productGroupService.updateProductGroup(
      id,
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
    const id = get(req.params, 'id');
    const productGroup = await productGroupService.deleteProductGroup(
      id
    );
    res.send(productGroup);
  } catch (error) {
    logger.error('deleteProductGroupByIdAction', error);
    next(error);
  }
};

export default {
  createProductGroupAction,
  fetchProductGroupAction,
  updateProductGroupAction,
  deleteProductGroupByIdAction,
};
