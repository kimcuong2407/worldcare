import express from 'express';
import loggerHelper from '@utils/logger.util';
import { MANUFACTURER_STATUS } from './constant';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import manufacturerService from './manufacturer.service';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { isUndefined } from 'lodash';

const logger = loggerHelper.getLogger('manufacturer.controller');

const validateManufacturer = async (info: any) => {
  // Name is required and unique
  const name = get(info, 'name', null);
  if (isNil(name)) {
    throw new ValidationFailedError('Name is required.');
  }
  const data = await manufacturerService.getManufacturerInfo({name});
  if (data && Object.keys(data).length != 0) {
    throw new ValidationFailedError(`Manufacturer with ${name} is already existed.`);
  }

  const status = get(info, 'status', MANUFACTURER_STATUS.ACTIVE);
  if(!Object.values(MANUFACTURER_STATUS).includes(status)){
    throw new ValidationFailedError('Status is invalid.');
  }
};

const createManufacturerAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, description, status } = req.body;
    const info = {
      name,
      description,
      status: status || MANUFACTURER_STATUS.ACTIVE,
    };
    await validateManufacturer(info);
    if (!name) {
      throw new ValidationFailedError('Name is required.');
    }

    const manufacturer = await manufacturerService.createManufacturer(info);
    res.send(manufacturer);
  } catch (error) {
    logger.error('createManufacturerAction', error);
    next(error);
  }
};

const fetchManufacturerListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const query = { status: { $ne: MANUFACTURER_STATUS.DELETED }};
    const manufacturer = await manufacturerService.getManufacturerList(
      query,
      language,
      raw
    );
    res.send(manufacturer);
  } catch (error) {
    logger.error('fetchManufacturerAction', error);
    next(error);
  }
};

const fetchManufacturerInfoAction = async (
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
    const manufacturer = await manufacturerService.getManufacturerInfo(
      query,
      language,
      raw
    );
    res.send(manufacturer);
  } catch (error) {
    logger.error('fetchManufacturerAction', error);
    next(error);
  }
};

const updateManufacturerAction = async (
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
      status: status,
    }
    await validateManufacturer(info);

    const manufacturer = await manufacturerService.updateManufacturer(
      id,
      omitBy(info, isNil)
    );

    res.send(manufacturer);
  } catch (error) {
    logger.error('updateManufacturerAction', error);
    next(error);
  }
};

const deleteManufacturerByIdAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const manufacturer = await manufacturerService.deleteManufacturer(
      id
    );
    res.send(manufacturer);
  } catch (error) {
    logger.error('deleteManufacturerByIdAction', error);
    next(error);
  }
};

export default {
  createManufacturerAction,
  fetchManufacturerListAction,
  fetchManufacturerInfoAction,
  updateManufacturerAction,
  deleteManufacturerByIdAction,
};
