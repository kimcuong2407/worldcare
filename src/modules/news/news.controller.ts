import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import newsService from './news.service';
import newsCategoryService from './newsCategory.service';
import { isUndefined, map } from 'lodash';
import { Types } from 'mongoose';
import userService from '../user/user.service';
import hospitalService from '../hospital/hospital.service';
import { NEWS_STATUS } from './constant';
import appUtil from '@app/utils/app.util';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('news.controller');

const createNewsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      title, description, content, category,
      metaTitle, metaDescription, metaKeywords,
      status, isFeatured, slug, coverPhoto,
    } = req.body;
    if(!title) {
      throw new ValidationFailedError('Title is required.');
    }
    if(!content) {
      throw new ValidationFailedError('Content is required.');
    }
  
    if(!category) {
      throw new ValidationFailedError('Categrory is required.');
    }
    category && map(category, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await newsCategoryService.getNewsCategoryByIdOrSlug(id))))) {
        throw new Error('There is no categoryId');
      }
    });


    const _news = {
      title,
      description,
      content,
      category: category || [],
      metaTitle,
      metaDescription,
      metaKeywords,
      author: req.user.id,
      status: status || NEWS_STATUS.EDITING,
      isFeatured: isFeatured || false,
      slug,
      coverPhoto,
    }
    const news = await newsService.createNews(_news);
    res.send(news);
  } catch (e) {
    logger.error('createNewsAction', e);
    next(e);
  }
};


const updateNewsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const newsId = get(req.params, 'id');
    const {
      title, description, content, category,
      metaTitle, metaDescription, metaKeywords,
      authorId, status, isFeatured, slug,
    } = req.body;
    category && map(category, async (id) => {
      if (id && (!Types.ObjectId.isValid(id) || (!(await newsCategoryService.getNewsCategoryByIdOrSlug(id))))) {
        throw new Error('There is no categoryId');
      }
    });
    // get the current user who creating the news
    if (authorId && (!Types.ObjectId.isValid(authorId) || (!(await userService.getUserProfileById(authorId))))) {
      throw new Error('There is no userId');
    }

    const _news = {
      title,
      description,
      content,
      category: category || [],
      metaTitle,
      metaDescription,
      metaKeywords,
      author: authorId,
      status: status || NEWS_STATUS.EDITING,
      isFeatured: isFeatured || false,
      slug,
    }
    const news = await newsService.updateNewsById(newsId, _news);

    res.send(news);
  } catch (e) {
    logger.error('createNewsAction', e);
    next(e);
  }
};


const fetchNewsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { status, slug, category, startTime, endTime } = req.query;
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const keyword = get(req, 'query.keyword', '');
    const language: string = get(req, 'language');
    const newss = await newsService.getNews({keyword, status, slug, category, startTime, endTime, options}, language, raw);
    res.send(newss);
  } catch (e) {
    logger.error('createNewsAction', e);
    next(e);
  }
};


const getNewsByIdOrSlugAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const newsId = get(req.params, 'id');
    const language: string = get(req, 'language');

    const raw: boolean = !isUndefined(get(req.query, 'raw'));

    const news = await newsService.getNewsByIdOrSlug(newsId, language, raw);
    res.send(news);
  } catch (e) {
    logger.error('getNewsByIdOrSlugAction', e);
    next(e);
  }
};


const deleteNewsByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const newsId = get(req.params, 'id');
    
    const news = await newsService.deleteNews(newsId);
    res.send(news);
  } catch (e) {
    logger.error('deleteNewsByIdAction', e);
    next(e);
  }
};

export default {
  createNewsAction,
  deleteNewsByIdAction,
  fetchNewsAction,
  getNewsByIdOrSlugAction,
  updateNewsAction,
}