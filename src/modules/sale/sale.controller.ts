import express from 'express';
import loggerHelper from '@utils/logger.util';
import {isNil} from 'lodash';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import saleService from './sale.service';
import saleOrderService from '../sale-orders/sale-order.service';
import {SALE_CHANNELS, SALE_TYPE} from './constant';
import invoiceService from '@modules/invoice/invoice.service';

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
      purchasedAt,
      involvedBy,
      prescription,
      isPrescriptionFilled,
      saleOrderId
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
      discountValue: discountValue || 0,
      discountPercent: discountPercent || 0,
      discountType,
      payment,
      note,
      purchasedAt,
      involvedBy
    }
    
    const saleId = req.params.saleId;
    let result;
    switch (type) {
      case SALE_TYPE.ORDER:
        const saleOrder = await saleOrderService.fetchSaleOrderInfoByQuery({
          _id: saleId,
          branchId
        });
        if (isNil(saleOrder) || Object.keys(saleOrder).length === 0) {
          throw new ValidationFailedError('Sale order can not be found.');
        }
        await saleService.checkBatchQuantity(items);

        await saleService.updateSaleOrder(saleId, baseInfo);

        result = await saleOrderService.fetchSaleOrderInfoByQuery({
          _id: saleId,
          branchId
        });
        res.send(result);
        break;
      case SALE_TYPE.DIRECT:
        const invoice = await invoiceService.fetchInvoiceInfoByQuery({
          _id: saleId,
          branchId
        });
        if (isNil(invoice)) {
          throw new ValidationFailedError('Invoice can not be found.');
        }
        const invoiceInfo = {
          ...baseInfo,
          prescription,
          isPrescriptionFilled,
          saleOrderId,
          // TODO: hardcode sale channel. update when sale channel feature implementation is finished
          saleChannel: SALE_CHANNELS.DIRECT
        };
        result = await saleService.updateInvoice(saleId, invoiceInfo);
        res.send(result);
        break;
      default:
        throw new ValidationFailedError(`Type ${type} does not support updating.`);
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
      note,
      prescription,
      isPrescriptionFilled,
      purchasedAt,
      involvedBy,
      saleOrderId
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
      involvedBy,
      items,
      partnerId,
      discountValue: discountValue || 0,
      discountPercent: discountPercent || 0,
      discountType,
      payment,
      purchasedAt
    }

    await saleService.validateSaleInput(baseInfo);
    switch (type) {
      case SALE_TYPE.DIRECT:
        console.log('Direct selling')
        const invoiceInfo = {
          ...baseInfo,
          prescription,
          isPrescriptionFilled,
          saleOrderId,
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
