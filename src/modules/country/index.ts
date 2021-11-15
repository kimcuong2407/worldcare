import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import countryController from './country.controller';


const manufacturerRoutes = (app: express.Application): void => {
  // Manufacturer
  app.post('/api/v1/manufacturer', countryController.createCountryAction);
  app.get('/api/v1/manufacturer', countryController.fetchCountryListAction);
  app.get('/api/v1/manufacturer/:id', countryController.fetchCountryInfoAction);
  app.put('/api/v1/manufacturer/:id', countryController.updateCountryAction);
  app.delete('/api/v1/manufacturer/:id', countryController.deleteCountryAction);
};

export default manufacturerRoutes;
