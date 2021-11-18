import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import loggerHelper from '@app/utils/logger.util';
import express from 'express';
import { get, isNil, isUndefined, omitBy } from 'lodash';
import { COUNTRY_STATUS } from './constant';
import countryService from './country.service';

const logger = loggerHelper.getLogger('country.controller');

const createCountryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const {
      name, description
    } = req.body;
    const info = {
      name,
      description,
    };
    const record = await countryService.createCountry(info);
    res.send(record);
  } catch (error) {
    logger.error('createCountryAction', error);
    next(error);
  }
};

const fetchCountryListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const record = await countryService.fetchCountryList(
      language,
      raw
    );
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchCountryInfoAction = async (
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
    const record = await countryService.fetchCountryInfo(
      query,
      language,
      raw
    );
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const updateCountryAction = async (
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
      status: status || COUNTRY_STATUS.ACTIVE,
    };

    const record = await countryService.updateCountry(
      id,
      omitBy(info, isNil)
    );

    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const deleteCountryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const id = get(req.params, 'id');
    const record = await countryService.deleteCountry(
      id
    );
    res.send(record);
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

export default {
  createCountryAction,
  fetchCountryListAction,
  fetchCountryInfoAction,
  updateCountryAction,
  deleteCountryAction,
};