/* eslint-disable max-len */
import loggerHelper from '@utils/logger.util';
import { InternalServerError } from '../types/ErrorTypes';
const logger = loggerHelper.getLogger('mongo.query');

const makeQuery = async <T>(asyncFunction: Promise<T | T[]>) : Promise<T | T[]> => {
  try {
    return await asyncFunction;
  } catch (e) {
    logger.error('makeQuery', e);
    throw new InternalServerError();
  }
};

export const makeTypedQuery = async <T>(asyncFunction: Promise<T>) : Promise<T> => {
  try {
    return await asyncFunction;
  } catch (e) {
    logger.error('makeQuery', e);
    throw new InternalServerError();
  }
};

export default makeQuery;
