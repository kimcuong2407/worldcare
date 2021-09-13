import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated, ValidationFailedError } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, map, omitBy, pick, toLower } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CouponCollection from '../coupon/coupon.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';
import employeeService from '../employee/employee.service';
import authService from '../auth/auth.service';
import { ROOT_COMPANY_ID } from '@app/core/constant';

const findCoupon = async (query: any) => {
  return makeQuery(CouponCollection.find(query).lean().exec());
}

const findOneCoupon = async (query: any) => {
  return makeQuery(CouponCollection.findOne(query).lean().exec());
}

const createCoupon = async (coupon: any) => {
  // const { 
  //   name,
  //   description,
  //   code,
  //   startTime,
  //   endTime,
  //   discountValue,
  //   discountPercent,
  //   isFreeShipping,
  //   maxDiscount,
  //   conditions,
  //   maxUsage,
  //   maxShippingDiscount,
  //  } = coupon;

  // const couponInfo = {
  //   name,
  //   description,
  //   code,
  //   startTime,
  //   endTime,
  //   discountValue,
  //   discountPercent,
  //   maxDiscount,
  //   conditions,
  //   maxUsage,
  //   isFreeShipping,
  //   maxShippingDiscount,
  // };
  return makeQuery(CouponCollection.create(coupon));
}


const updateCoupon = async (couponId: string, coupon: any) => {
  return makeQuery(CouponCollection.findByIdAndUpdate(couponId, { $set: coupon }, { new: true }).exec());
}

const findCouponById = async (couponId: string) => {
  return makeQuery(CouponCollection.findById(couponId).exec());
}

const getCouponInfo = async (couponId: string) => {
  let data = await CouponCollection.findById(couponId).lean();
  return data;
}

const getValidCoupon = async (couponCode: string) => {
  const coupon: any = await CouponCollection.findOne({
    code: toLower(couponCode),
    startTime: {
      $lte: new Date(),
    },
    endTime: {
      $gte: new Date(),
    },
    $or: [
      {
        $where: '!this.usageCount || (this.usageCount < this.maxUsage)',
      },
      {
        maxUsage: null,
      }
    ]
  });
  return coupon;
}

const fetchCoupon = async (params: any, options: any) => {
  const {
    code, startTime, endTime,
  } = params;
  const query: any = {
    deletedAt: null,
  };
  if (code) {
    query['code'] = code;
  }
  if (startTime) {
    query['startTime'] = {
      $gte: startTime,
    };
  }
  if (endTime) {
    query['endTime'] = {
      $lte: endTime
    }
  }
  let data = await CouponCollection.paginate(query, {
    ...options,
    sort: {
      name: -1,
    }
  });
  return data;
}

const deleteCoupon = async (couponId: string) => {
  await CouponCollection.findByIdAndUpdate(couponId, { $set: { deletedAt: new Date() } });
  return true;
};

const getFreeCoupon = async () => {
  return makeQuery(CouponCollection.find({
    startTime: {
      $lte: new Date()
    },
    endTime: {
      $gte: new Date()
    },
    deletedAt: null,
  }).exec());
}

export default {
  findCoupon,
  createCoupon,
  findCouponById,
  deleteCoupon,
  fetchCoupon,
  getCouponInfo,
  updateCoupon,
  getValidCoupon,
  getFreeCoupon,
  findOneCoupon,
};
