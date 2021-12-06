import loggerHelper from '@utils/logger.util';
import {get, isNil, clone, map} from 'lodash';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import InventoryTransactionCollection from '@modules/inventory-transaction/inventory-transaction.collection';
import InvoiceCollection from '@modules/invoice/invoice.collection';
import SaleOrderCollection from '@modules/sale-orders/sale-order.collection';
import BatchCollection from '@modules/batch/batch.collection';
import invoiceService from '@modules/invoice/invoice.service'
import saleOrderService from '@modules/sale-orders/sale-order.service'
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service'
import prescriptionService from '@modules/prescription-v2/prescription.service'
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE, TRANSACTION_TYPE} from '@modules/payment-note/constant';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';
import {INVOICE_STATUS} from '@modules/invoice/constant';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import {SALE_ORDER_STATUS} from '@modules/sale-orders/constant';
import BranchCollection from '@modules/branch/branch.collection';
import ProductVariantCollection from '@modules/product/productVariant.collection';
import ProductCollection from '@modules/product/product.collection';

const logger = loggerHelper.getLogger('purchaseOrder.service');

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
 * 1. Create payment note. code prefix: TTHD
 * 2. Create invoice record. code prefix: HD
 * 3. Create inventory transaction. type: SELL_PRODUCT
 */
const createInvoice = async (invoiceInfo: any) => {
  const payment = invoiceInfo.payment;

  // 0. Check quantity status

  // 1. Create payment note.
  const paymentNote = await createPaymentNote(payment, invoiceInfo, TRANSACTION_TYPE.TTHD);

  // 2. Create invoice record.
  const invoice = {
    customerId: invoiceInfo.customerId,
    branchId: invoiceInfo.branchId,
    partnerId: invoiceInfo.partnerId,
    status: INVOICE_STATUS.COMPLETED,
    saleChannel: invoiceInfo.saleChannel,
    soldById: invoiceInfo.soldById,
    createById: invoiceInfo.createdBy,
    invoiceDetail: invoiceInfo.items,
    paymentNoteId: undefined as any,
    discountValue: invoiceInfo.discountValue,
    discountPercent: invoiceInfo.discountPercent,
    discountType: invoiceInfo.discountType,
    prescriptionId: undefined as any
  }

  if (invoiceInfo.isPrescriptionFilled && !isNil(invoiceInfo.prescription)) {
    invoiceInfo.prescription.branchId = invoiceInfo.branchId;
    const prescription = await prescriptionService.persistPrescription(invoiceInfo.prescription);
    invoice.prescriptionId = get(prescription, '_id')
  }

  if (paymentNote) {
    invoice.paymentNoteId = paymentNote['_doc']['_id'];
  }

  for (const item of invoice.invoiceDetail) {
    item.branch = await BranchCollection.findOne({_id: item.branchId}).lean().exec();
    item.variant = await ProductVariantCollection.findOne({_id: item.variantId}).lean().exec();
    item.batch = await BatchCollection.findOne({_id: item.batchId}).lean().exec();
    item.product = await ProductCollection.findOne({_id: item.productId}).lean().exec();
  }

  const createdInvoiceDoc = await InvoiceCollection.create(invoice);
  await invoiceService.invoiceAutoIncrease(createdInvoiceDoc)
  const createdInvoice = createdInvoiceDoc['_doc']
  logger.info(`Created Invoice Code[${createdInvoice.code}]`);
  paymentNote.referenceDocId = createdInvoice['_id'];
  await paymentNote.save();

  // 3. Create inventory transaction.
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT, invoiceInfo, createdInvoice['_id']);

  return createdInvoice;

}

/**
 * Create sale order
 * Steps:
 * 1. Create payment note. code prefix: TTDH
 * 2. Create sale order record. code prefix: DH
 * 3. Create inventory transaction. type: ORDER_PRODUCT
 * @param saleOrderInfo
 */
const createSaleOrder = async (saleOrderInfo: any) => {
  const payment = saleOrderInfo.payment;

  // 0. Check quantity status

  // 1. Create payment note.
  const paymentNote = await createPaymentNote(payment, saleOrderInfo, TRANSACTION_TYPE.TTDH);

  // 2. Create sale order record.
  const saleOrder = {
    customerId: saleOrderInfo.customerId,
    branchId: saleOrderInfo.branchId,
    partnerId: saleOrderInfo.partnerId,
    status: PURCHASE_ORDER_STATUS.DRAFT,
    createById: saleOrderInfo.createdBy,
    saleOrderDetail: saleOrderInfo.items,
    paymentNoteId: undefined as any,
    discountValue: saleOrderInfo.discountValue,
    discountPercent: saleOrderInfo.discountPercent,
    discountType: saleOrderInfo.discountType,
    saleChannel: saleOrderInfo.saleChannel,
    note: saleOrderInfo.note
  }

  if (paymentNote) {
    saleOrder.paymentNoteId = paymentNote['_doc']['_id'];
  }

  const createdSaleOrderDoc = await SaleOrderCollection.create(saleOrder);
  await saleOrderService.saleOrderAutoIncrease(createdSaleOrderDoc);
  const createdSaleOrder = createdSaleOrderDoc['_doc']
  logger.info(`Created SaleOrder Code[${createdSaleOrder.code}]`);
  paymentNote.referenceDocId = createdSaleOrder['_id'];
  await paymentNote.save();

  // 3. Create inventory transaction.
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT, saleOrderInfo, createdSaleOrder['_id']);

  return createdSaleOrder;
}

async function createInventoryTransaction(type: string, inputInfo: any, referenceId: string) {
  for (const detailItem of inputInfo.items) {
    const inventoryTransactionInfo = {
      type,
      partnerId: inputInfo.partnerId,
      branchId: inputInfo.branchId,
      productId: detailItem.productId,
      variantId: detailItem.variantId,
      batchId: detailItem.batchId,
      quantity: detailItem.quantity,
      referenceDocId: referenceId
    }
    const inventoryTransaction = await InventoryTransactionCollection.create(inventoryTransactionInfo);
    logger.info(`Created InventoryTransaction with ID[${inventoryTransaction['_doc']['_id']}]`)
    const batchDoc = await BatchCollection.findOne({_id: detailItem.batchId}).exec();
    if (!isNil(batchDoc)) {
      await BatchCollection.findOneAndUpdate({_id: detailItem.batchId}, {
        quantity: get(batchDoc, '_doc').quantity - detailItem.quantity
      }).exec();
    }
  }
}

async function createPaymentNote(payment: any, info: any, transactionType: string) {
  if (payment.amount && payment.amount > 0) {
    const paymentNoteInfo = {
      type: PAYMENT_NOTE_TYPE.RECEIPT,
      transactionType,
      branchId: info.branchId,
      involvedById: info.involvedById,
      createdById: info.createdBy,
      paymentMethod: payment.method,
      paymentDetail: payment.detail,
      paymentAmount: payment.amount,
      totalPayment: payment.totalPayment,
    };

    let paymentNote = await PaymentNoteCollection.create(paymentNoteInfo);
    paymentNote.code = initCode(transactionType, paymentNote.paymentNoteCodeSequence);
    logger.info(`Saving payment note with code[${paymentNote.code}]`)
    await paymentNote.save();
    logger.info(`Created payment note with code[${paymentNote.code}]`)
    return paymentNote;
  }
  return null;
}

/**
 * if status is COMPLETED. only update Note
 * if status is DRAFT. update data. update batch quantity.
 * if status from DRAFT to COMPLETED. update data. update batch quantity. create Invoice.
 * @param id
 * @param saleOrderInfo
 */
const updateSaleOrder = async (id: string, saleOrderInfo: any) => {
  const saleOrderDoc = await SaleOrderCollection.findById(id);
  const saleOrder = get(saleOrderDoc, '_doc');

  // status COMPLETED
  if (saleOrder.status === SALE_ORDER_STATUS.COMPLETED) {
    const resultDoc = await SaleOrderCollection.findByIdAndUpdate(id, {
      $set: {
        note: saleOrderInfo.note
      }
    });
    return get(resultDoc, '_doc');
  }

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
      status: saleOrderInfo.status
    }
  });

  const inventoryTransactions = await InventoryTransactionCollection.find({
    type: INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT,
    referenceDocId: id,
    deletedAt: null
  });
  for (const transaction of inventoryTransactions) {
    await inventoryTransactionService.deleteInventoryTransaction(get(transaction, '_doc._id'))
  }
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT, saleOrderInfo, id);

  // status changes from DRAFT to COMPLETED, create an invoice
  if (saleOrderInfo.status === SALE_ORDER_STATUS.COMPLETED) {
    const updatedSaleOrder = get(updatedSaleOrderDoc, '_doc');
    const invoice = {
      customerId: updatedSaleOrder.customerId,
      branchId: updatedSaleOrder.branchId,
      partnerId: updatedSaleOrder.partnerId,
      status: INVOICE_STATUS.COMPLETED,
      saleChannel: updatedSaleOrder.saleChannel,
      soldById: updatedSaleOrder.soldById,
      createById: updatedSaleOrder.createById,
      invoiceDetail: saleOrderInfo.items,
      paymentNoteId: undefined as any,
      discountValue: updatedSaleOrder.discountValue,
      discountPercent: updatedSaleOrder.discountPercent,
      discountType: updatedSaleOrder.discountType
    }
    if (updatedSaleOrder.paymentNoteId) {
      invoice.paymentNoteId = updatedSaleOrder.paymentNoteId;
    }
    const createdInvoiceDoc = await InvoiceCollection.create(invoice);
    await invoiceService.invoiceAutoIncrease(createdInvoiceDoc)
    const createdInvoice = createdInvoiceDoc['_doc']
    logger.info(`Created Invoice Code[${createdInvoice.code}]`);
  }

  return get(updatedSaleOrderDoc, '_doc')
}

const initCode = (prefix: string, seq: number) => {
  let s = '000000000' + seq;
  return prefix + s.substr(s.length - 6);
}

export default {
  createInvoice,
  createSaleOrder,
  checkBatchQuantity,
  updateSaleOrder
};
