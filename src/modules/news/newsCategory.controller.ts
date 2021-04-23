import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import newsService from './news.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('degree.controller');

// DEGREE
const createNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await newsService.createNewsCategory(req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const updateNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await newsService.updateNewsCategoryById(degreeId, req.body);

    res.send(setResponse(degree));
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const fetchNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await newsService.getNewsCategory(
      [
        'name',
        'incrementId'
      ]
    );
    res.send(setResponse(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId']))));
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const getNewsCategoryByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await newsService.getNewsCategoryByIdOrSlug(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('getNewsCategoryByIdOrSlugAction', e);
    next(e);
  }
};


const deleteNewsCategoryByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    
    const degree = await newsService.deleteNewsCategory(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('deleteNewsCategoryByIdAction', e);
    next(e);
  }
};

export default {
  createNewsCategoryAction,
  deleteNewsCategoryByIdAction,
  fetchNewsCategoryAction,
  getNewsCategoryByIdOrSlugAction,
  updateNewsCategoryAction,
}