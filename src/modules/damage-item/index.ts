import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CLINIC_RESOURCES } from '@app/core/permissions';
import express from 'express';
import damageItemActions from './damageItem.controller';

const damageItemRoutes = (app: express.Application): void => {
  app.post('/api/v1/damage-item', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.write]
  ]), damageItemActions.create);

  app.put('/api/v1/damage-item/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.update]
  ]), damageItemActions.update);

  app.get('/api/v1/damage-item', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), damageItemActions.fetch);

  app.get('/api/v1/damage-item/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.read]
  ]), damageItemActions.getById);

  app.delete('/api/v1/damage-item/:id', middleware.authorization([
    [CLINIC_RESOURCES.sale, CORE_ACTIONS.delete]
  ]), damageItemActions.cancelAction);

};

export default damageItemRoutes;
