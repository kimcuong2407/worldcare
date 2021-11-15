import express from 'express';
import loggerHelper from '@utils/logger.util';
import { PRODUCT_UNIT_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import ProductUnitService from './productUnit.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('ProductUnit.controller');

const validateProductUnit = async (info: any) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const data = await ProductUnitService.getProductUnitInfo({ name });
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(
      `Product Unit with ${name} is already existed.`
    );
  }

  const status = get(info, 'status', PRODUCT_UNIT_STATUS.ACTIVE);
  if(!Object.values(PRODUCT_UNIT_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }
};

const createProductUnitAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_UNIT_STATUS.ACTIVE,
    };
    await validateProductUnit(info);

    const ProductUnit = await ProductUnitService.createProductUnit(
      info
    );
    res.send(ProductUnit);
  } catch (error) {
    logger.error('createProductUnitAction', error);
    next(error);
  }
};

const fetchProductUnitListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const ProductUnit = await ProductUnitService.getProductUnitList(
      language,
      raw
    );
    res.send(ProductUnit);
  } catch (error) {
    logger.error('fetchProductUnitAction', error);
    next(error);
  }
};

const fetchProductUnitInfoAction = async (
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
    const ProductUnit = await ProductUnitService.getProductUnitInfo(
      query,
      language,
      raw
    );
    res.send(ProductUnit);
  } catch (error) {
    logger.error('fetchProductUnitAction', error);
    next(error);
  }
};

const updateProductUnitAction = async (
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
      status: status || PRODUCT_UNIT_STATUS.ACTIVE,
    };
    await validateProductUnit(info);

    const ProductUnit = await ProductUnitService.updateProductUnit(
      id,
      omitBy(info, isNil)
    );

    res.send(ProductUnit);
  } catch (error) {
    logger.error('updateProductUnitAction', error);
    next(error);
  }
};

const deleteProductUnitByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const ProductUnit = await ProductUnitService.deleteProductUnit(
      id
    );
    res.send(ProductUnit);
  } catch (error) {
    logger.error('deleteProductUnitByIdAction', error);
    next(error);
  }
};

export default {
  createProductUnitAction,
  fetchProductUnitListAction,
  fetchProductUnitInfoAction,
  updateProductUnitAction,
  deleteProductUnitByIdAction,
};
