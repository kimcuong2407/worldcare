import middleware from '@app/core/middleware';
import express from 'express';
import configurationActions from './configuration.controller';

const configurationRoutes = (app: express.Application): void => {
  app.post('/api/v1/degree', middleware.authenticate, configurationActions.createDegreeAction);
  app.get('/api/v1/degree', configurationActions.fetchDegreeAction);
  app.put('/api/v1/degree/:id', middleware.authenticate, configurationActions.updateDegreeAction);
  app.get('/api/v1/degree/:id', middleware.authenticate, configurationActions.getDegreeByIdAction);


  app.post('/api/v1/title', middleware.authenticate, configurationActions.createTitleAction);
  app.get('/api/v1/title', configurationActions.fetchTitleAction);
  app.put('/api/v1/title/:id', middleware.authenticate, configurationActions.updateTitleAction);
  app.get('/api/v1/title/:id', middleware.authenticate, configurationActions.getTitleByIdAction);

  app.post('/api/v1/speciality', middleware.authenticate, configurationActions.createSpecialityAction);
  app.get('/api/v1/speciality',  configurationActions.fetchSpecialityAction);
  app.put('/api/v1/speciality/:id', middleware.authenticate, configurationActions.updateSpecialityAction);
  app.get('/api/v1/speciality/:id', middleware.authenticate, configurationActions.getSpecialityByIdAction);
  app.delete('/api/v1/speciality/:id', middleware.authenticate, configurationActions.deleteSpecialityAction);

  app.post('/api/v1/employee-group', middleware.authenticate, configurationActions.createEmployeeGroupAction);
  app.get('/api/v1/employee-group', configurationActions.fetchEmployeeGroupAction);
  app.put('/api/v1/employee-group/:id', middleware.authenticate, configurationActions.updateEmployeeGroupAction);
  app.get('/api/v1/employee-group/:id', middleware.authenticate, configurationActions.getEmployeeGroupByIdAction);

  app.get('/api/v1/city', configurationActions.getCityListAction);
  app.get('/api/v1/district', configurationActions.getDistrictListAction);
  app.get('/api/v1/ward', configurationActions.getWardListAction);
  app.get('/api/v1/city/:cityCode/district', configurationActions.getDistrictListByCityAction);
  app.get('/api/v1/district/:districtCode/ward', configurationActions.getWardListByDistrictAction);

  app.get('/api/v1/supported-cities', configurationActions.getListSupportedCityAction);
  // app.get('/api/v1/appointment-service', configurationActions.getListAppointmentServiceAction);

};

export default configurationRoutes;
