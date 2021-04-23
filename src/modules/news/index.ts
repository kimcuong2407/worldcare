import middleware from '@app/core/middleware';
import express from 'express';
import categoryActions from './newsCategory.controller';

const categoryRoutes = (app: express.Application): void => {
  app.post('/api/v1/news-category', categoryActions.createNewsCategoryAction);
  app.get('/api/v1/news-category', categoryActions.getNewsCategoryByIdOrSlugAction);
  app.put('/api/v1/news-category/:id', categoryActions.updateNewsCategoryAction);
  app.get('/api/v1/news-category/:id', categoryActions.getNewsCategoryByIdOrSlugAction);
};

export default categoryRoutes;
