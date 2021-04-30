import middleware from '@app/core/middleware';
import express from 'express';
import categoryActions from './newsCategory.controller';
import newsActions from './news.controller';

const categoryRoutes = (app: express.Application): void => {
  // News Category
  app.post('/api/v1/news-category', middleware.authenticate, categoryActions.createNewsCategoryAction);
  app.get('/api/v1/news-category', categoryActions.fetchNewsCategoryAction);
  app.get('/api/v1/news-category/:id', categoryActions.getNewsCategoryByIdOrSlugAction);
  app.put('/api/v1/news-category/:id', middleware.authenticate,  categoryActions.updateNewsCategoryAction);
  app.delete('/api/v1/news-category/:id', middleware.authenticate,  categoryActions.deleteNewsCategoryByIdAction);

  // News
  app.post('/api/v1/news', middleware.authenticate,  newsActions.createNewsAction);
  app.get('/api/v1/news', newsActions.fetchNewsAction);
  app.get('/api/v1/news/:id', newsActions.getNewsByIdOrSlugAction);
  app.put('/api/v1/news/:id', middleware.authenticate, newsActions.updateNewsAction);
  app.delete('/api/v1/news/:id', middleware.authenticate, newsActions.deleteNewsByIdAction);
};

export default categoryRoutes;
