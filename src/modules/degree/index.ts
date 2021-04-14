import middleware from '@app/core/middleware';
import express from 'express';
import degreeActions from './degree.controller';

const degreeRoutes = (app: express.Application): void => {
  app.post('/api/v1/degree', degreeActions.createDegreeAction);
  app.get('/api/v1/degree', degreeActions.fetchDegreeAction);
  app.put('/api/v1/degree/:id', degreeActions.updateDegreeAction);
  app.get('/api/v1/degree/:id', degreeActions.getDegreeByIdAction);

};

export default degreeRoutes;
