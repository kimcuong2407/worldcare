import express from 'express';
import loggerHelper from '@utils/logger.util';
import { PRODUCT_POSITION_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import ProductPositionService from './productPosition.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('ProductPosition.controller');

const validateProductPosition = async (info: any, id?: string) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const query = isNil(id) ? { name, status: { $ne: PRODUCT_POSITION_STATUS.DELETED } } : { _id: { $ne: id }, name, status: { $ne: PRODUCT_POSITION_STATUS.DELETED } };
  const data = await ProductPositionService.getProductPositionInfo(query);
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(
      `Product Position with ${name} is already existed.`
    );
  }

  const status = get(info, 'status', PRODUCT_POSITION_STATUS.ACTIVE);
  if(!Object.values(PRODUCT_POSITION_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }
};

const createProductPositionAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_POSITION_STATUS.ACTIVE,
      branchId,
    };
    await validateProductPosition(info);

    const ProductPosition = await ProductPositionService.createProductPosition(
      info
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('createProductPositionAction', error);
    next(error);
  }
};

const fetchProductPositionListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const query = { branchId, status: { $ne: PRODUCT_POSITION_STATUS.DELETED } };
    const ProductPosition = await ProductPositionService.getProductPositionList(
      query,
      language,
      raw
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('fetchProductPositionAction', error);
    next(error);
  }
};

const fetchProductPositionInfoAction = async (
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
    const ProductPosition = await ProductPositionService.getProductPositionInfo(
      query,
      language,
      raw
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('fetchProductPositionInfoAction', error);
    next(error);
  }
}

const updateProductPositionAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const id = get(req.params, 'id');
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status,
    };
    await validateProductPosition(info, id);

    const ProductPosition = await ProductPositionService.updateProductPosition(
      { _id: id, branchId },
      omitBy(info, isNil)
    );

    res.send(ProductPosition);
  } catch (error) {
    logger.error('updateProductPositionAction', error);
    next(error);
  }
};

const deleteProductPositionByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const ProductPosition = await ProductPositionService.deleteProductPosition(
      id
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('deleteProductPositionByIdAction', error);
    next(error);
  }
};

export default {
  createProductPositionAction,
  fetchProductPositionListAction,
  fetchProductPositionInfoAction,
  updateProductPositionAction,
  deleteProductPositionByIdAction,
};
