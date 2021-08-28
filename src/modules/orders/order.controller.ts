import express from 'express';
import loggerHelper from '@utils/logger.util';
import orderService from './order.service';
import get from 'lodash/get';
import appUtil from '@app/utils/app.util';
import { isNil, isString, isUndefined, map, omit, omitBy, pick } from 'lodash';
import { uploadImage } from '../file/file.service';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import zalo from '@app/core/zalo';
import PrescriptionCollection from './prescription.collection';
import { getPreSignedUrl } from '@app/core/s3';
import orderActions from './actions';
import { setResponse } from '@app/utils/response.util';
import { ORDER_STATUS } from './constant';

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

const getOrderDetailAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const orderNumber = get(req.params, 'orderNumber');
    let entityId = get(req.query, 'branchId');

    if(!req.isRoot) {
      entityId = req.companyId;
    }
    const query: any = {orderNumber: orderNumber};

    if(entityId) {
      query.branchId = entityId;
    }

    const result: any = await orderService.findOrderDetail(query);
    if(result.prescriptionId) {
      const prescription = await getPrescriptionDetail(result.prescriptionId);
      result.prescription = pick(prescription, ['_id','images']);
    }
    res.send(result);
  } catch (e) {
    logger.error('getOrderDetailAction', e);
    next(e);
  }
};

const getOrderAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.id;
    const { page, limit } = appUtil.getPaging(req);
    const { status, companyId, startTime, endTime, sortBy, sortDirection } = req.query;
    const entityId = companyId;

    if(!req.isRoot) {
      entityId = req.companyId;
    }
    const orderStatus = status ? String(status).split(',') : null;
    const result = await orderService.findOrders(omitBy({
      status: orderStatus && orderStatus.length > 0 ? orderStatus : null, branchId: entityId, startTime, endTime, sortBy, sortDirection,
    }, isNil), page, limit);
    res.send(result);
  } catch (e) {
    logger.error('getOrderAction', e);
    next(e);
  }
};


const getPendingOrderAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.id;
    const { page, limit } = appUtil.getPaging(req);
    const { status, companyId, startTime, endTime, sortBy, sortDirection } = req.query;
    const entityId = companyId;

    if(!req.isRoot) {
      entityId = req.companyId;
    }
    const result = await orderService.findOrders(omitBy({
      branchId: entityId, startTime, endTime, sortBy, sortDirection,
      status: [
        ORDER_STATUS.NEW,
        ORDER_STATUS.RECEIVED,
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PACKAGED,
        ORDER_STATUS.PROCESSED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPING,
      ]
    }, isNil), page, limit);
    res.send(result);
  } catch (e) {
    logger.error('getOrderAction', e);
    next(e);
  }
};


const handleOrderAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.user.id;
    const action = get(req.params, 'action');
    const orderNumber = get(req.params, 'orderNumber');
    const data = req.body;
    let entityId = null;
    const query: any = {
      orderNumber,
    }
    if(!req.isRoot) {
      entityId = req.companyId;
      query.branchId = entityId;
    }
    
    const order = await orderService.findOrderDetail(query);
    if(!order) {
      throw new NotFoundError();
    }

    const handler = orderActions.getOrderActionHandler(action, get(order, 'status'));
    await handler.handle(order, {
      data,
      userId,
    });
    const newOrder = await orderService.findOrderDetail(query);

    res.send(setResponse(newOrder, true));
  } catch (e) {
    logger.error('handleOrderAction', e);
    next(e);
  }
};

export default { 
  createPrescriptionAction,
  createOrderAction,
  getMyOrderAction,
  getMyOrderDetailAction,
  getOrderAction,
  getPendingOrderAction,
  getOrderDetailAction,
  handleOrderAction,
};

