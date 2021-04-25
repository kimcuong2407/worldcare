import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import newsService from './news.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('category.controller');

// DEGREE
const createNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const category = await newsService.createNewsCategory(req.body);

    res.send(category);
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const updateNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = get(req.params, 'id');
    const category = await newsService.updateNewsCategoryById(categoryId, req.body);

    res.send(category);
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const fetchNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const language: string = get(req, 'language');
    const categorys = await newsService.getNewsCategory(language);
    res.send(categorys);
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const getNewsCategoryByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = get(req.params, 'id');
    const language: string = get(req, 'language');

    const raw: string = get(req.query, 'raw');

    const category = await newsService.getNewsCategoryByIdOrSlug(categoryId, language, raw);
    res.send(category);
  } catch (e) {
    logger.error('getNewsCategoryByIdOrSlugAction', e);
    next(e);
  }
};


const deleteNewsCategoryByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = get(req.params, 'id');
    
    const category = await newsService.deleteNewsCategory(categoryId);
    res.send(category);
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