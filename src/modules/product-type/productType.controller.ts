import express from 'express';
import loggerHelper from '@utils/logger.util';
import { PRODUCT_TYPE_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import ProductTypeService from './productType.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('ProductType.controller');

const validateProductType = async (info: any) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const data = await ProductTypeService.getProductTypeInfo({ name });
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(
      `Product Unit with ${name} is already existed.`
    );
  }

  const status = get(info, 'status', PRODUCT_TYPE_STATUS.ACTIVE);
  if(!Object.values(PRODUCT_TYPE_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }
};

const createProductTypeAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_TYPE_STATUS.ACTIVE,
    };
    await validateProductType(info);

    const ProductType = await ProductTypeService.createProductType(
      info
    );
    res.send(ProductType);
  } catch (error) {
    logger.error('createProductTypeAction', error);
    next(error);
  }
};

const fetchProductTypeListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const ProductType = await ProductTypeService.getProductTypeList(
      language,
      raw
    );
    res.send(ProductType);
  } catch (error) {
    logger.error('fetchProductTypeAction', error);
    next(error);
  }
};

const fetchProductTypeInfoAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const id = get(req.params, 'id');
    if (isNil(id)) {
      throw new ValidationFailedError('id is required.');
    }
    const query = { _id: id };
    const ProductType = await ProductTypeService.getProductTypeInfo(
      query,
      language,
      raw
    );
    res.send(ProductType);
  } catch (error) {
    logger.error('fetchProductTypeAction', error);
    next(error);
  }
};

const updateProductTypeAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_TYPE_STATUS.ACTIVE,
    };
    await validateProductType(info);

    const ProductType = await ProductTypeService.updateProductType(
      id,
      omitBy(info, isNil)
    );

    res.send(ProductType);
  } catch (error) {
    logger.error('updateProductTypeAction', error);
    next(error);
  }
};

const deleteProductTypeByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const ProductType = await ProductTypeService.deleteProductType(
      id
    );
    res.send(ProductType);
  } catch (error) {
    logger.error('deleteProductTypeByIdAction', error);
    next(error);
  }
};

export default {
  createProductTypeAction,
  fetchProductTypeListAction,
  fetchProductTypeInfoAction,
  updateProductTypeAction,
  deleteProductTypeByIdAction,
};
