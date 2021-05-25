import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import newsService from './news.service';
import newsCategoryService from './newsCategory.service';
import { isNil, isUndefined, lowerCase, map, omit, omitBy, trim } from 'lodash';
import { Types } from 'mongoose';
import userService from '../user/user.service';
import hospitalService from '../hospital/hospital.service';
import { NEWS_STATUS } from './constant';
import appUtil from '@app/utils/app.util';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import NewsCollection from './news.collection';
import NewsCategoryCollection from './newsCategory.collection';
import slugify from 'slugify';
import normalizeText from 'normalize-text';

const logger = loggerHelper.getLogger('news.controller');

const createNewsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      title, description, content, category,
      metaTitle, metaDescription, metaKeywords,
      status, isFeatured, slug, coverPhoto,
      tags,
    } = req.body;
    if (!title) {
      throw new ValidationFailedError('Title is required.');
    }
    if (!content) {
      throw new ValidationFailedError('Content is required.');
    }

    if (!category) {
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
      slug: slug || slugify(trim(lowerCase(normalizeText(title)))),
      tags,
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
      authorId, status, isFeatured, slug, tags,
      coverPhoto,
    } = req.body;
    if (category) {
      map(category, async (id) => {
        if (id && (!Types.ObjectId.isValid(id) || (!(await newsCategoryService.getNewsCategoryByIdOrSlug(id))))) {
          throw new Error('There is no categoryId');
        }
      });
    }
    // get the current user who creating the news
    if (authorId && (!Types.ObjectId.isValid(authorId) || (!(await userService.getUserProfileById(authorId))))) {
      throw new Error('There is no userId');
    }

    const _news = {
      title,
      description,
      content,
      category: category,
      metaTitle,
      metaDescription,
      metaKeywords,
      author: authorId,
      status: status,
      isFeatured: isFeatured,
      coverPhoto,
      slug,
      tags,
    }
    const news = await newsService.updateNewsById(newsId, omitBy(_news, isNil));

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
    const newss = await newsService.getNews({ keyword, status, slug, category, startTime, endTime, options }, language, raw);
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


const getLatestNewsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const language: string = get(req, 'language');

    const categories = await NewsCategoryCollection.aggregate([
      {
        '$match': {
          'deletedAt': null,
        }
      },
      {
        '$lookup': {
          'from': 'news',
          'let': {
            'category_id': '$_id'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {
                      '$in': [
                        '$$category_id', '$category'
                      ]
                    }, {
                      '$eq': [
                        '$status', NEWS_STATUS.PUBLISHED
                      ]
                    }
                  ]
                }
              }
            }, {
              '$sort': {
                'created': -1
              }
            }, {
              '$limit': 5
            }
          ],
          'as': 'news'
        }
      }, {
        '$sort': {
          'index': 1
        }
      }
    ]).exec();

    const featured = await NewsCollection.findOne({isFeatured: true}).populate('category', ['name', 'slug']).sort({createdAt: -1});
    
    res.send({
      featured: featured,
      latest: map(categories, (category) => {
        const { news, ...rest } = category;
        return {
          ...appUtil.mapLanguage(rest, language),
          news: map(news, (newsContent) => appUtil.mapLanguage(newsContent, language))
        }
      })
    });
  } catch (e) {
    logger.error('getLatestNewsAction', e);
    next(e);
  }
};
export default {
  createNewsAction,
  deleteNewsByIdAction,
  fetchNewsAction,
  getNewsByIdOrSlugAction,
  updateNewsAction,
  getLatestNewsAction,
}