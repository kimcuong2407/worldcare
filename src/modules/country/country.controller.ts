import loggerHelper from "@app/utils/logger.util";
import express from 'express';

const logger = loggerHelper.getLogger('country.controller');

const createCountryAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    
  } catch (error) {
    logger.error('', error);
    next(error);
  }
};

const fetchCountryListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    
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