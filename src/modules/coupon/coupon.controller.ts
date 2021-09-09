import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import couponService from './coupon.service';
import omit from 'lodash/omit';
import { setResponse } from '@app/utils/response.util';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import appUtil from '@app/utils/app.util';
import jwtUtil from '@app/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { toLower, xor } from 'lodash';

const logger = loggerHelper.getLogger('coupon.controller');

const fetchCouponAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { page, limit } = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const code = get(req.query, 'code');
    const startTime = get(req.query, 'keyworstartTimed');
    const endTime = get(req.query, 'endTime');

    const coupons = await couponService.fetchCoupon({ 
      code,
      startTime,
      endTime,
     }, options)
    res.send(coupons);
  } catch (e) {
    logger.error('fetchCouponAction', e);
    next(e);
  }
}

const createCouponAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      name,
      description,
      code,
      startTime,
      endTime,
      discountValue,
      discountPercent,
      isFreeShipping,
      maxDiscount,
      conditions,
      maxUsage,
      maxShippingDiscount,
    } = req.body;

    if(!name) {
      throw new ValidationFailedError('Vui lòng nhập tiêu đề của mã giảm giá.')
    }
    if(!code) {
     throw new ValidationFailedError('Vui lòng nhập mã giảm giá.')
   }
   if(!startTime) {
     throw new ValidationFailedError('Vui lòng nhập ngày bắt đầu có hiệu lực của mã giảm giá.')
   }
   if(!endTime) {
     throw new ValidationFailedError('Vui lòng nhập ngày kết thúc hiệu lực của mã giảm giá.')
   }
 
   if(!discountPercent && !discountValue) {
     throw new ValidationFailedError('Vui lòng nhập giá trị của mã giảm giá theo số tiền hoặc theo %.')
   }

   if(discountPercent && discountValue && discountPercent >0 && discountValue > 0) {
    throw new ValidationFailedError('Không thể áp dụng cùng lúc giảm giá theo giá trị và phần trăm.')
  }
   const existingCode = await couponService.findCoupon({
     code: toLower(code)
   });
   if(existingCode && existingCode.length> 0) {
      throw new ValidationFailedError('Mã giảm giá đã tồn tại.')
   }
   
    const createdCoupon = await couponService.createCoupon(
      {
        name,
        description,
        code: toLower(code),
        startTime,
        endTime,
        discountValue,
        discountPercent,
        isFreeShipping,
        maxDiscount,
        conditions,
        maxUsage,
        maxShippingDiscount,
      }
    );
    res.send(setResponse(createdCoupon, true, 'Mã giảm giá đã được tạo thành công.'));
  } catch (e) {
    logger.error('createCouponAction', e);
    next(e);
  }
}

const updateCouponAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      name,
      description,
      startTime,
      endTime,
      discountValue,
      discountPercent,
      isFreeShipping,
      maxDiscount,
      conditions,
      maxUsage,
      maxShippingDiscount,
    } = req.body;

    if(!name) {
      throw new ValidationFailedError('Vui lòng nhập tiêu đề của mã giảm giá.')
    }

   if(!startTime) {
     throw new ValidationFailedError('Vui lòng nhập ngày bắt đầu có hiệu lực của mã giảm giá.')
   }
   if(!endTime) {
     throw new ValidationFailedError('Vui lòng nhập ngày kết thúc hiệu lực của mã giảm giá.')
   }

   if(!discountPercent && !discountValue) {
    throw new ValidationFailedError('Vui lòng nhập giá trị của mã giảm giá theo số tiền hoặc theo %.')
  }

  if(discountPercent && discountValue && discountPercent >0 && discountValue > 0) {
   throw new ValidationFailedError('Không thể áp dụng cùng lúc giảm giá theo giá trị và phần trăm.')
 }

    const updatedCoupon = await couponService.updateCoupon(
      get(req.params, 'couponId'),
      {
        name,
        description,
        startTime,
        endTime,
        discountValue,
        discountPercent,
        isFreeShipping,
        maxDiscount,
        conditions,
        maxUsage,
        maxShippingDiscount,
      }
    );
    res.send(setResponse(updatedCoupon, true, 'Coupon đã được cập nhật thành công.'));
  } catch (e) {
    logger.error('updateCouponAction', e);
    next(e);
  }
}

const getCouponDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let couponId = get(req.params, 'couponId');

    const coupon: any = await couponService.getCouponInfo(couponId);

    res.send(setResponse(coupon, true));
  } catch (e) {
    logger.error('getCouponDetailAction', e);
    next(e);
  }
}

const checkCouponDetailAction  = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let couponCode = get(req.params, 'couponCode');

    const coupon = await couponService.getValidCoupon(couponCode);
    if(!coupon) {
      throw new NotFoundError('Mã giảm giá không tồn tại hoặc đã hết hiệu lực.');
    }
    const { name, code, discountValue, discountPercent, maxDiscount } = coupon;
    res.send(setResponse({
      name,
      code,
      discountValue,
      discountPercent: !discountValue ? discountPercent : 0,
      maxDiscount,
    }, true));
  } catch (e) {
    logger.error('getCouponDetailAction', e);
    next(e);
  }
}

const deleteCouponAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let couponId = get(req.params, 'couponId');

    await couponService.deleteCoupon(couponId)
    res.send(setResponse({}, true, 'Coupon đã được xóa thành công.'));
  } catch (e) {
    logger.error('deleteCouponAction', e);
    next(e);
  }
}

const getFreeCouponAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {

    const coupon = await couponService.getFreeCoupon();
    res.send(setResponse(coupon, true));
  } catch (e) {
    logger.error('getFreeCouponAction', e);
    next(e);
  }
}


export default {
  fetchCouponAction,
  createCouponAction,
  updateCouponAction,
  getCouponDetailAction,
  deleteCouponAction,
  checkCouponDetailAction,
  getFreeCouponAction,
};
