import express from 'express';
import loggerHelper from '@utils/logger.util';
import {isNil, get} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import appUtil from '@utils/app.util';
import saleService from './sale.service';
import saleOrderService from '../sale-orders/sale-order.service';
import {SALE_CHANNELS, SALE_TYPE} from './constant';

const logger = loggerHelper.getLogger('purchaseOrder.controller');

const updateSaleTransaction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;
    const {
      customerId,
      soldById, // employeeId
      items,
      type,
      discountValue,
      discountPercent,
      discountType,
      payment,
      note,
      status
    } = req.body;
    if (type !== SALE_TYPE.DIRECT && type !== SALE_TYPE.ORDER) {
      throw new ValidationFailedError('Sale type is not correct.');
    }
    
    const baseInfo = {
      branchId,
      customerId,
      soldById,
      createdBy: req.user.id,
      involvedById: req.user.id,
      items,
      partnerId,
      discountValue,
      discountPercent,
      discountType,
      payment,
      status,
      note
    }

    
    const saleId = req.params.saleId;
    switch (type) {
      case SALE_TYPE.ORDER:
        const saleOrder = await saleOrderService.fetchSaleOrderInfoByQuery({
          _id: saleId,
          branchId
        });
        if (isNil(saleOrder) || Object.keys(saleOrder).length === 0) {
          throw new ValidationFailedError('Purchase order can not be found.');
        }
        const result = await saleService.updateSaleOrder(saleId, baseInfo);
        res.send(result);
        break;
      case SALE_TYPE.DIRECT:
        throw new ValidationFailedError('Currently not support update invoice.');
    }
  } catch (error) {
    logger.error('updateSaleTransaction', error);
    next(error);
  }
}

const createSaleTransaction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const partnerId = req.user.partnerId;

    const {
      customerId,
      soldById, // employeeId
      items,
      type,
      discountValue,
      discountPercent,
      discountType,
      payment,
      note
    } = req.body;

    if (type !== SALE_TYPE.DIRECT && type !== SALE_TYPE.ORDER) {
      throw new ValidationFailedError('Sale type is not correct.');
    }

    await saleService.checkBatchQuantity(items);
    const baseInfo = {
      branchId,
      customerId,
      soldById,
      createdBy: req.user.id,
      involvedById: req.user.id,
      items,
      partnerId,
      discountValue,
      discountPercent,
      discountType,
      payment
    }

    switch (type) {
      case SALE_TYPE.DIRECT:
        console.log('Direct selling')
        const invoiceInfo = {
          ...baseInfo,
          // TODO: hardcode sale channel. update when sale channel feature implementation is finished
          saleChannel: SALE_CHANNELS.DIRECT
        };
        const invoiceRecord = await saleService.createInvoice(invoiceInfo);
        res.send(invoiceRecord);
        break;
      case SALE_TYPE.ORDER:
        console.log('Customer order product')
        const orderInfo = {
          ...baseInfo,
          note,
          // TODO: hardcode sale channel. update when sale channel feature implementation is finished
          saleChannel: SALE_CHANNELS.ORDER
        }
        const orderRecord = await saleService.createSaleOrder(orderInfo);
        res.send(orderRecord);
        break;
    }
  } catch (error) {
    logger.error('createSaleTransaction', error);
    next(error);
  }
};


export default {
  create: createSaleTransaction,
  update: updateSaleTransaction
};
