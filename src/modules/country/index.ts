import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import countryController from './country.controller';

const countryRoutes = (app: express.Application): void => {
  // country
  app.post('/api/v1/country', countryController.createCountryAction);
  // app.get('/api/v1/country', countryController.fetchCountryListAction);
  app.get('/api/v1/country/:id', countryController.fetchCountryInfoAction);
  app.put('/api/v1/country/:id', countryController.updateCountryAction);
  app.delete('/api/v1/country/:id', countryController.deleteCountryAction);
};

export default countryRoutes;
