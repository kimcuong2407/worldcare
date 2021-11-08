import express from 'express';
import loggerHelper from '@utils/logger.util';
import { PRODUCT_ROUTE_ADMINISTRATION_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import productRouteAdministrationService from './productRouteAdministration.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('ProductPosition.controller');

const validateProductRouteAdministration = async (info: any) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const data = await productRouteAdministrationService.getProductRouteAdministrationInfo(
    { name }
  );
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(
      `Product Route Administration with ${name} is already existed.`
    );
  }

  const status = get(info, 'status', PRODUCT_ROUTE_ADMINISTRATION_STATUS.ACTIVE);
  if(!Object.values(PRODUCT_ROUTE_ADMINISTRATION_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }
};

const createProductRouteAdministrationAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_ROUTE_ADMINISTRATION_STATUS.ACTIVE,
    };
    await validateProductRouteAdministration(info);

    const ProductPosition = await productRouteAdministrationService.createProductRouteAdministration(
      info
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('createProductRouteAdministrationAction', error);
    next(error);
  }
};

const fetchProductRouteAdministrationAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const ProductPosition = await productRouteAdministrationService.getProductRouteAdministration(
      language,
      raw
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('fetchProductRouteAdministrationAction', error);
    next(error);
  }
};

const updateProductRouteAdministrationAction = async (
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
      status: status || PRODUCT_ROUTE_ADMINISTRATION_STATUS.ACTIVE,
    };
    await validateProductRouteAdministration(info);

    const ProductPosition = await productRouteAdministrationService.updateProductRouteAdministration(
      id,
      omitBy(info, isNil)
    );

    res.send(ProductPosition);
  } catch (error) {
    logger.error('updateProductRouteAdministrationAction', error);
    next(error);
  }
};

const deleteProductRouteAdministrationByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const ProductPosition = await productRouteAdministrationService.deleteProductRouteAdministration(
      id
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('deleteProductRouteAdministrationByIdAction', error);
    next(error);
  }
};

export default {
  createProductRouteAdministrationAction,
  fetchProductRouteAdministrationAction,
  updateProductRouteAdministrationAction,
  deleteProductRouteAdministrationByIdAction,
};
