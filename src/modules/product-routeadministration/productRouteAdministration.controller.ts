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

const validateProductRouteAdministration = async (info: any, id?: string) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const query = isNil(id) ? { name, status: { $ne: PRODUCT_ROUTE_ADMINISTRATION_STATUS.DELETED } } : { _id: { $ne: id }, name, status: { $ne: PRODUCT_ROUTE_ADMINISTRATION_STATUS.DELETED } };
  const data = await productRouteAdministrationService.getProductRouteAdministrationInfo(
    query
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
    const branchId = get(req, 'companyId');
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || PRODUCT_ROUTE_ADMINISTRATION_STATUS.ACTIVE,
      branchId,
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

const fetchProductRouteAdministrationListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const query = { branchId, status: { $ne: PRODUCT_ROUTE_ADMINISTRATION_STATUS.DELETED } };
    const ProductPosition = await productRouteAdministrationService.getProductRouteAdministrationList(
      query,
      language,
      raw
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('fetchProductRouteAdministrationAction', error);
    next(error);
  }
};

const fetchProductRouteAdministrationInfoAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
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
    const ProductPosition = await productRouteAdministrationService.getProductRouteAdministrationInfo(
      query,
      language,
      raw
    );
    res.send(ProductPosition);
  } catch (error) {
    logger.error('fetchProductRouteAdministrationInfoAction', error);
    next(error);
  }
};

const updateProductRouteAdministrationAction = async (
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
    await validateProductRouteAdministration(info, id);

    const ProductPosition = await productRouteAdministrationService.updateProductRouteAdministration(
      { _id: id, branchId },
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
  fetchProductRouteAdministrationListAction,
  fetchProductRouteAdministrationInfoAction,
  updateProductRouteAdministrationAction,
  deleteProductRouteAdministrationByIdAction,
};
