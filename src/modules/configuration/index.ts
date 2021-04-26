import middleware from '@app/core/middleware';
import express from 'express';
import configurationActions from './configuration.controller';

const configurationRoutes = (app: express.Application): void => {
  app.post('/api/v1/degree', configurationActions.createDegreeAction);
  app.get('/api/v1/degree', configurationActions.fetchDegreeAction);
  app.put('/api/v1/degree/:id', configurationActions.updateDegreeAction);
  app.get('/api/v1/degree/:id', configurationActions.getDegreeByIdAction);


  app.post('/api/v1/title', configurationActions.createTitleAction);
  app.get('/api/v1/title', configurationActions.fetchTitleAction);
  app.put('/api/v1/title/:id', configurationActions.updateTitleAction);
  app.get('/api/v1/title/:id', configurationActions.getTitleByIdAction);

  app.post('/api/v1/speciality', configurationActions.createSpecialityAction);
  app.get('/api/v1/speciality', configurationActions.fetchSpecialityAction);
  app.put('/api/v1/speciality/:id', configurationActions.updateSpecialityAction);
  app.get('/api/v1/speciality/:id', configurationActions.getSpecialityByIdAction);

  app.post('/api/v1/employee-group', configurationActions.createEmployeeGroupAction);
  app.get('/api/v1/employee-group', configurationActions.fetchEmployeeGroupAction);
  app.put('/api/v1/employee-group/:id', configurationActions.updateEmployeeGroupAction);
  app.get('/api/v1/employee-group/:id', configurationActions.getEmployeeGroupByIdAction);

  app.get('/api/v1/city', configurationActions.getCityListAction);
  app.get('/api/v1/city/:cityCode/district', configurationActions.getDistrictListAction);
  app.get('/api/v1/district/:districtCode/ward', configurationActions.getWardListByDistrictAction);

};

export default configurationRoutes;
