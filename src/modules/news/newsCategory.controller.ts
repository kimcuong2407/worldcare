import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import newsCategoryService from './newsCategory.service';
import map from 'lodash/map';
import pick from 'lodash/pick';
import { isUndefined } from 'lodash';
import NewsCollection from './news.collection';
import appUtil from '@app/utils/app.util';

const logger = loggerHelper.getLogger('category.controller');

// DEGREE
const createNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const category = await newsCategoryService.createNewsCategory(req.body);

    res.send(category);
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const updateNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = get(req.params, 'id');
    const category = await newsCategoryService.updateNewsCategoryById(categoryId, req.body);

    res.send(category);
  } catch (e) {
    logger.error('createNewsCategoryAction', e);
    next(e);
  }
};


const fetchNewsCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const language: string = get(req, 'language');
    const categorys = await newsCategoryService.getNewsCategory(language);
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

    const raw: boolean = !isUndefined(get(req.query, 'raw'));

    const category = await newsCategoryService.getNewsCategoryByIdOrSlug(categoryId, language, raw);
    res.send(category);
  } catch (e) {
    logger.error('getNewsCategoryByIdOrSlugAction', e);
    next(e);
  }
};


const deleteNewsCategoryByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = get(req.params, 'id');
    
    const category = await newsCategoryService.deleteNewsCategory(categoryId);
    res.send(category);
  } catch (e) {
    logger.error('deleteNewsCategoryByIdAction', e);
    next(e);
  }
};


const getNewsByCategoryAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const language: string = get(req, 'language');

    const options = {
      page, limit,
    }
    const categoryId = get(req.params, 'id');
    const news = await newsCategoryService.getNewsByCategory(categoryId, options, language);
    res.send(news);
  } catch (e) {
    logger.error('getNewsByCategoryAction', e);
    next(e);
  }
};

export default {
  createNewsCategoryAction,
  deleteNewsCategoryByIdAction,
  fetchNewsCategoryAction,
  getNewsCategoryByIdOrSlugAction,
  updateNewsCategoryAction,
  getNewsByCategoryAction,
}