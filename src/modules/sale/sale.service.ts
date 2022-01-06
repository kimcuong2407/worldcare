import loggerHelper from '@utils/logger.util';
import {get, isNil} from 'lodash';
import InvoiceCollection from '@modules/invoice/invoice.collection';
import SaleOrderCollection from '@modules/sale-orders/sale-order.collection';
import BatchCollection from '@modules/batch/batch.collection';
import invoiceService from '@modules/invoice/invoice.service'
import saleOrderService from '@modules/sale-orders/sale-order.service'
import prescriptionService from '@modules/prescription-v2/prescription.service'
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE, PaymentNoteConstants} from '@modules/payment-note/constant';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';
import {INVOICE_STATUS} from '@modules/invoice/constant';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import {SALE_ORDER_STATUS} from '@modules/sale-orders/constant';
import ProductVariantCollection from '@modules/product/productVariant.collection';
import ProductCollection from '@modules/product/product.collection';
import paymentNoteService from '@modules/payment-note/payment-note.service';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';

const logger = loggerHelper.getLogger('sale.service');

const checkBatchQuantity = async (items: any) => {
  if (!items || items.length === 0) {
    throw new ValidationFailedError('Invoice detail is not valid.');
  }
  for (const detailItem of items) {
    const batchDoc = await BatchCollection.findById(detailItem.batchId);
    if (isNil(batchDoc)) {
      throw new ValidationFailedError(`Batch ID ${detailItem.batchId} does not exist.`);
    }
    const batch = get(batchDoc, '_doc');
    if (detailItem.quantity > batch.quantity) {
      throw new ValidationFailedError(`Quantity is not valid for Batch ID ${detailItem.batchId}.`);
    }
  }
}

/**
 * Create Invoice
 * Steps:
 * 0. Check if invoice is creating bases on a sale order.
 * 0.1. if sale order is not existed. throw error.
 * 0.2. if sale order is existed, 
 * copy Order's PaymentNoteIds to invoice's PaymentNoteIds
 * set Order's invoiceId .
 * set Order's status is Completed.
 * 1. Create invoice record. code prefix: HD
 * 2. Create payment note. code prefix: TTHD
 * 3. Create inventory transaction. type: SELL_PRODUCT
 */
const createInvoice = async (invoiceInfo: any) => {
  logger.info('Start create invoice. ' + JSON.stringify(invoiceInfo));

  const paymentNoteIds: any[] = [];
  let totalPayment = 0;

  // 0. Check if invoice is creating bases on a sale order.
  if (!isNil(invoiceInfo.saleOrderId)) {
    const saleOrder = await SaleOrderCollection.findOne({
      _id: invoiceInfo.saleOrderId,
      branchId: invoiceInfo.branchId
    }).populate('paymentNotes').lean().exec();
    if (isNil(saleOrder)) {
      throw new ValidationFailedError('Sale order does not exist.');
    }
    if (saleOrder.status === SALE_ORDER_STATUS.COMPLETED) {
      throw new ValidationFailedError(`Sale order ID ${invoiceInfo.saleOrderId} is already completed.`);
    }
    const saleOrderPaymentNoteIds = saleOrder.paymentNoteIds || [];
    paymentNoteIds.push(...saleOrderPaymentNoteIds);
    const saleOrderPaymentNotes = saleOrder.paymentNotes || [];
    totalPayment += saleOrderPaymentNotes
      .filter((note: any) => note.type === PAYMENT_NOTE_TYPE.RECEIPT)
      .reduce((a: any, b: { paymentAmount: number }) => a + b.paymentAmount, 0);
  }

  // 1. Create invoice record.
  const invoice = {
    customerId: invoiceInfo.customerId,
    branchId: invoiceInfo.branchId,
    partnerId: invoiceInfo.partnerId,
    status: INVOICE_STATUS.COMPLETED,
    saleChannel: invoiceInfo.saleChannel,
    soldById: invoiceInfo.soldById,
    createdById: invoiceInfo.createdBy,
    invoiceDetail: invoiceInfo.items,
    paymentNoteIds,
    discountValue: invoiceInfo.discountValue,
    discountPercent: invoiceInfo.discountPercent,
    discountType: invoiceInfo.discountType,
    prescriptionId: undefined as any,
    involvedBy: invoiceInfo.involvedBy,
    purchasedAt: invoiceInfo.purchasedAt,
    saleOrderId: invoiceInfo.saleOrderId,
    totalPayment,
    total: 0 as number
  }

  if (invoiceInfo.isPrescriptionFilled && !isNil(invoiceInfo.prescription)) {
    invoiceInfo.prescription.branchId = invoiceInfo.branchId;
    const prescription = await prescriptionService.persistPrescription(invoiceInfo.prescription);
    invoice.prescriptionId = get(prescription, '_id')
    logger.info(`set invoice.prescriptionId=${invoice.prescriptionId}`);
  }

  for (const item of invoice.invoiceDetail) {
    item.variant = await ProductVariantCollection.findOne({_id: item.variantId})
      .populate('unit').lean().exec();
    item.batch = await BatchCollection.findOne({_id: item.batchId}).lean().exec();
    item.product = await ProductCollection.findOne({_id: item.productId}).lean().exec();
    // Calculate invoice's total
    invoice.total += item.price * item.quantity;
  }

  const createdInvoiceDoc = await InvoiceCollection.create(invoice);
  await invoiceService.invoiceAutoIncrease(createdInvoiceDoc)
  const createdInvoice = createdInvoiceDoc['_doc']
  logger.info(`Created Invoice Code[${createdInvoice.code}]`);

  // update SaleOrder status and invoiceId
  if (!isNil(invoiceInfo.saleOrderId)) {
    const updatedSaleOrder = await SaleOrderCollection.findByIdAndUpdate(invoiceInfo.saleOrderId, {
      $set: {
        status: SALE_ORDER_STATUS.COMPLETED,
        invoiceId: createdInvoice._id
      }
    }, {new: true}).lean().exec();
    logger.info(`update saleOrder code=${updatedSaleOrder.code}: status=COMPLETED, invoiceId=${createdInvoice._id}`);
  }

  // 2. Create payment note.
  const payment = invoiceInfo.payment;
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(
    payment, invoiceInfo, PaymentNoteConstants.TTHD, true, createdInvoice._id);

  if (paymentNote) {
    const invoicePaymentNoteIds = createdInvoice.paymentNoteIds || [];
    invoicePaymentNoteIds.push(get(paymentNote, '_doc._id'));
    totalPayment += +get(paymentNote, '_doc.paymentAmount')
    await InvoiceCollection.findByIdAndUpdate(createdInvoice._id, {
      $set: {
        paymentNoteIds: invoicePaymentNoteIds,
        totalPayment
      }
    })
  }

  // 3. Create inventory transaction.
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT, invoiceInfo, createdInvoice['_id']);

  return await invoiceService.fetchInvoiceInfoByQuery({_id: createdInvoice._id});

}

/**
 * Create sale order
 * Steps:
 * 1. Create payment note. code prefix: TTDH
 * 2. Create sale order record. code prefix: DH
 * @param saleOrderInfo
 */
const createSaleOrder = async (saleOrderInfo: any) => {
  logger.info('Start create sale order. ' + JSON.stringify(saleOrderInfo));
  const payment = saleOrderInfo.payment;

  // 0. Check quantity status

  // 1. Create payment note.
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(
    payment, saleOrderInfo, PaymentNoteConstants.TTDH, true);

  // 2. Create sale order record.
  const saleOrder = {
    customerId: saleOrderInfo.customerId,
    branchId: saleOrderInfo.branchId,
    partnerId: saleOrderInfo.partnerId,
    status: PURCHASE_ORDER_STATUS.DRAFT,
    createdById: saleOrderInfo.createdBy,
    saleOrderDetail: saleOrderInfo.items,
    paymentNoteIds: [] as any[],
    discountValue: saleOrderInfo.discountValue || 0,
    discountPercent: saleOrderInfo.discountPercent || 0,
    discountType: saleOrderInfo.discountType,
    saleChannel: saleOrderInfo.saleChannel,
    note: saleOrderInfo.note,
    involvedBy: saleOrderInfo.involvedBy,
    purchasedAt: saleOrderInfo.purchasedAt,
    customerNeedToPay: 0,
    customerPaid: 0
  }

  if (paymentNote) {
    saleOrder.paymentNoteIds.push(paymentNote['_doc']['_id']);
    saleOrder.customerPaid = paymentNote['_doc']['paymentAmount'];
  }

  const saleOrderPayment = calculateSaleOrderPayment(saleOrder.saleOrderDetail, saleOrder.discountValue);
  saleOrder.customerNeedToPay = saleOrderPayment.customerNeedToPay;

  const createdSaleOrderDoc = await SaleOrderCollection.create(saleOrder);
  await saleOrderService.saleOrderAutoIncrease(createdSaleOrderDoc);
  const createdSaleOrder = createdSaleOrderDoc['_doc']
  logger.info(`Created SaleOrder Code[${createdSaleOrder.code}]`);

  if (paymentNote) {
    paymentNote.referenceDocId = createdSaleOrder['_id'];
    await paymentNote.save();
  }

  return await saleOrderService.fetchSaleOrderInfoByQuery({_id: createdSaleOrder._id});
}

async function createInventoryTransaction(type: INVENTORY_TRANSACTION_TYPE, inputInfo: any, referenceId: string) {
  for (const detailItem of inputInfo.items) {
    const inventoryTransactionInfo = {
      type,
      partnerId: inputInfo.partnerId,
      branchId: inputInfo.branchId,
      customerId: inputInfo.customerId,
      productId: detailItem.productId,
      variantId: detailItem.variantId,
      batchId: detailItem.batchId,
      quantity: detailItem.quantity,
      referenceDocId: referenceId
    }
    await inventoryTransactionService.createInventoryTransaction(inventoryTransactionInfo, type);
  }
}

/**
 * if status is COMPLETED. only update Note
 * if status is DRAFT. update data. update batch quantity.
 * if status from DRAFT to COMPLETED. update data. update batch quantity. create Invoice.
 * @param id
 * @param saleOrderInfo
 */
const updateSaleOrder = async (id: string, saleOrderInfo: any) => {
  const savedSaleOrder = await SaleOrderCollection.findById(id).lean();

  // If status is Completed.
  // ONLY update note
  if (savedSaleOrder.status === SALE_ORDER_STATUS.COMPLETED) {
    const resultDoc = await SaleOrderCollection.findByIdAndUpdate(id, {
      $set: {
        note: saleOrderInfo.note
      }
    });
    return get(resultDoc, '_doc');
  }

  const payment = saleOrderInfo.payment;
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(
    payment, saleOrderInfo, PaymentNoteConstants.TTDH, true, id);
  const paymentNoteIds = savedSaleOrder.paymentNoteIds || [];
  let customerPaid = savedSaleOrder.customerPaid || 0;
  if (paymentNote) {
    customerPaid += +get(paymentNote, '_doc.paymentAmount')
    paymentNoteIds.push(get(paymentNote, '_doc._id'));
  }

  const saleOrderPayment = calculateSaleOrderPayment(saleOrderInfo.items, saleOrderInfo.discountValue);
  const customerNeedToPay = saleOrderPayment.customerNeedToPay;

  // status DRAFT
  const updatedSaleOrderDoc = await SaleOrderCollection.findByIdAndUpdate(id, {
    $set: {
      customerId: saleOrderInfo.customerId,
      soldById: saleOrderInfo.soldById,
      saleOrderDetail: saleOrderInfo.items,
      discountValue: saleOrderInfo.discountValue,
      discountPercent: saleOrderInfo.discountPercent,
      discountType: saleOrderInfo.discountType,
      note: saleOrderInfo.note,
      purchasedAt: saleOrderInfo.purchasedAt,
      involvedBy: saleOrderInfo.involvedBy,
      paymentNoteIds,
      customerPaid,
      customerNeedToPay
    }
  }, { new: true }).exec();

  return get(updatedSaleOrderDoc, '_doc')
}

const calculateSaleOrderPayment = (items: any[], discountValue: number = 0) => {
  const total: number = items
    .reduce((a: any, b: { price: any, quantity: any }) => a + parseFloat(b.price) * parseInt(b.quantity), 0);
  const customerNeedToPay = total - discountValue;
  return {
    total,
    customerNeedToPay: customerNeedToPay < 0 ? 0 : customerNeedToPay
  }
}

export default {
  createInvoice,
  createSaleOrder,
  checkBatchQuantity,
  updateSaleOrder
};
