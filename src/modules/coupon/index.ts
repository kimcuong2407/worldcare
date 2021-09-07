import middleware from '@app/core/middleware';
import { CORE_ACTIONS, CORE_RESOURCES, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import couponActions from './coupon.controller';

const couponRoutes = (app: express.Application): void => {
  app.post('/api/v1/coupon', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.write],
  ]), couponActions.createCouponAction);

  app.get('/api/v1/coupon', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.read],
  ]), couponActions.fetchCouponAction);

  app.get('/api/v1/coupon/:couponId', couponActions.getCouponDetailAction);
  app.get('/api/v1/check-coupon/:couponCode', couponActions.checkCouponDetailAction);

  app.put('/api/v1/coupon/:couponId', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.update],
  ]), couponActions.updateCouponAction);

  app.delete('/api/v1/coupon/:couponId', middleware.authorization([
    [ROOT_RESOURCES.cms, CORE_ACTIONS.delete],
  ]), couponActions.deleteCouponAction);
};

export default couponRoutes;
