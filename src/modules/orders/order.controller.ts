import express from 'express';
import loggerHelper from '@utils/logger.util';
import orderService from './order.service';
import slugify from 'slugify';
import { normalizeText } from 'normalize-text';
import get from 'lodash/get';
import lowerCase from 'lodash/lowerCase';
import trim from 'lodash/trim';
import appUtil from '@app/utils/app.util';
import { isNil, isString, isUndefined, map, omit, omitBy, pick } from 'lodash';
import { setResponse } from '@app/utils/response.util';
import moment from 'moment';
import authService from '../auth/auth.service';
import { uploadImage } from '../file/file.service';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import zalo from '@app/core/zalo';
import PrescriptionCollection from './prescription.collection';
import { getPreSignedUrl } from '@app/core/s3';

const logger = loggerHelper.getLogger('company.controller');

const createOrderAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      prescriptionId,
      addressId,
      address,
      companyId,
    } = req.body;
    const userId = get(req, 'user.id', '');

    if(!userId && !address) {
      throw new ValidationFailedError('Vui lòng nhập thông tin và địa chỉ nhận hàng.')
    }

    if(userId && !addressId) {
      throw new ValidationFailedError('Vui lòng chọn thông tin địa chỉ nhận hàng.')
    }
    const data = await orderService.createOrder({
      prescriptionId,
      addressId,
      address,
      userId,
      companyId,
    });
    await orderService.updatePrescription(prescriptionId, get(data, 'orderNumber'));
    await zalo.sendZaloMessage(`New order created: ${get(data, 'orderNumber')}`);
    res.send(data);
  } catch (e) {
    logger.error('createOrderAction', e);
    next(e);
  }
};

const createPrescriptionAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const uploadedFile = await uploadImage(req.file, 'prescription');
    const result = await orderService.createPrescription(uploadedFile.Key);
    res.send({
      prescriptionId: get(result, '_id'),
    });
  } catch (e) {
    logger.error('createPrescriptionAction', e);
    next(e);
  }
};

const getMyOrderAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.id;
    const { page, limit } = appUtil.getPaging(req);

    const result = await orderService.findOrders({userId: userId}, page, limit);
    res.send(result);
  } catch (e) {
    logger.error('getMyOrderAction', e);
    next(e);
  }
};

const getPrescriptionDetail = async (prescriptionId: string) => {
  const prescription: any = await PrescriptionCollection.findById(prescriptionId).lean().exec();
  const { images } = prescription;
  const presignedImages = await Promise.all(map(images || [], (image: string)=> getPreSignedUrl(image)));
  return {
    ...prescription,
    images: presignedImages,
  }
}

const getMyOrderDetailAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.id;
    const orderNumber = get(req.params, 'orderNumber');

    const result: any = await orderService.findOrderDetail({userId: userId, orderNumber: orderNumber});
    if(result.prescriptionId) {
      const prescription = await getPrescriptionDetail(result.prescriptionId);
      result.prescription = pick(prescription, ['_id','images']);
    }
    res.send(result);
  } catch (e) {
    logger.error('getMyOrderDetailAction', e);
    next(e);
  }
};

export default { 
  createPrescriptionAction,
  createOrderAction,
  getMyOrderAction,
  getMyOrderDetailAction,
};
