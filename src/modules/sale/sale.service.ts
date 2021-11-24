import loggerHelper from '@utils/logger.util';
import {get, isNil, clone, map} from 'lodash';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import InventoryTransactionCollection from '@modules/inventory-transaction/inventory-transaction.collection';
import InvoiceCollection from '@modules/invoice/invoice.collection';
import PurchaseOrderCollection from '@modules/purchaseOrder/purchase-order.collection';
import LotCollection from '@modules/batch/batch.collection';
import invoiceService from '@modules/invoice/invoice.service'
import purchaseOrderService from '@modules/purchaseOrder/purchase-order.service'
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service'
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE, TRANSACTION_TYPE} from '@modules/payment-note/constant';
import {PURCHASE_RECEIPT_STATUS} from '@modules/purchase-receipt/constant';
import {INVOICE_STATUS} from '@modules/invoice/constant';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import {PURCHASE_ORDER_STATUS} from '@modules/purchaseOrder/constant';

const logger = loggerHelper.getLogger('purchaseReceipt.service');

const checkBatchQuantity = async (items: any) => {
  if (!items || items.length === 0) {
    throw new ValidationFailedError('Invoice detail is not valid.');
  }
  for (const detailItem of items) {
    const batchDoc = await LotCollection.findById(detailItem.batchId);
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
 * 2. Create purchase order record. code prefix: HD
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
    discountType: invoiceInfo.discountType
  }

  if (paymentNote) {
    invoice.paymentNoteId = paymentNote['_doc']['_id'];
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
 * Create purchase order
 * Steps:
 * 1. Create payment note. code prefix: TTDH
 * 2. Create purchase order record. code prefix: DH
 * 3. Create inventory transaction. type: ORDER_PRODUCT
 * @param purchaseOrderInfo
 */
const createPurchaseOrder = async (purchaseOrderInfo: any) => {
  const payment = purchaseOrderInfo.payment;

  // 0. Check quantity status

  // 1. Create payment note.
  const paymentNote = await createPaymentNote(payment, purchaseOrderInfo, TRANSACTION_TYPE.TTDH);

  // 2. Create purchase order record.
  const purchaseOrder = {
    customerId: purchaseOrderInfo.customerId,
    branchId: purchaseOrderInfo.branchId,
    partnerId: purchaseOrderInfo.partnerId,
    status: PURCHASE_RECEIPT_STATUS.DRAFT,
    createById: purchaseOrderInfo.createdBy,
    purchaseOrderDetail: purchaseOrderInfo.items,
    paymentNoteId: undefined as any,
    discountValue: purchaseOrderInfo.discountValue,
    discountPercent: purchaseOrderInfo.discountPercent,
    discountType: purchaseOrderInfo.discountType,
    saleChannel: purchaseOrderInfo.saleChannel,
    note: purchaseOrderInfo.note
  }

  if (paymentNote) {
    purchaseOrder.paymentNoteId = paymentNote['_doc']['_id'];
  }

  const createdPurchaseOrderDoc = await PurchaseOrderCollection.create(purchaseOrder);
  await purchaseOrderService.purchaseOrderAutoIncrease(createdPurchaseOrderDoc);
  const createdPurchaseOrder = createdPurchaseOrderDoc['_doc']
  logger.info(`Created PurchaseOrder Code[${createdPurchaseOrder.code}]`);
  paymentNote.referenceDocId = createdPurchaseOrder['_id'];
  await paymentNote.save();

  // 3. Create inventory transaction.
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT, purchaseOrderInfo, createdPurchaseOrder['_id']);

  return createdPurchaseOrder;
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
    const batchDoc = await LotCollection.findOne({_id: detailItem.batchId}).exec();
    if (!isNil(batchDoc)) {
      await LotCollection.findOneAndUpdate({_id: detailItem.batchId}, {
        quantity: get(batchDoc, '_doc').quantity - detailItem.quantity
      }).exec();
    }
  }
}

async function createPaymentNote(payment: any, info: any, transactionType: string) {
  if (payment.amount && payment.amount > 0) {
    const paymentNoteInfo = {
      type: PAYMENT_NOTE_TYPE.PAYMENT,
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
 * @param purchaseOrderInfo
 */
const updatePurchaseOrder = async (id: string, purchaseOrderInfo: any) => {
  const purchaseOrderDoc = await PurchaseOrderCollection.findById(id);
  const purchaseOrder = get(purchaseOrderDoc, '_doc');

  // status COMPLETED
  if (purchaseOrder.status === PURCHASE_ORDER_STATUS.COMPLETED) {
    const resultDoc = await PurchaseOrderCollection.findByIdAndUpdate(id, {
      $set: {
        note: purchaseOrderInfo.note
      }
    });
    return get(resultDoc, '_doc');
  }

  // status DRAFT
  const updatedPurchaseOrderDoc = await PurchaseOrderCollection.findByIdAndUpdate(id, {
    $set: {
      customerId: purchaseOrderInfo.customerId,
      soldById: purchaseOrderInfo.soldById,
      purchaseOrderDetail: purchaseOrderInfo.items,
      discountValue: purchaseOrderInfo.discountValue,
      discountPercent: purchaseOrderInfo.discountPercent,
      discountType: purchaseOrderInfo.discountType,
      note: purchaseOrderInfo.note,
      status: purchaseOrderInfo.status
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
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT, purchaseOrderInfo, id);

  // status changes from DRAFT to COMPLETED, create an invoice
  if (purchaseOrderInfo.status === PURCHASE_ORDER_STATUS.COMPLETED) {
    const updatedPurchaseOrder = get(updatedPurchaseOrderDoc, '_doc');
    const invoice = {
      customerId: updatedPurchaseOrder.customerId,
      branchId: updatedPurchaseOrder.branchId,
      partnerId: updatedPurchaseOrder.partnerId,
      status: INVOICE_STATUS.COMPLETED,
      saleChannel: updatedPurchaseOrder.saleChannel,
      soldById: updatedPurchaseOrder.soldById,
      createById: updatedPurchaseOrder.createById,
      invoiceDetail: purchaseOrderInfo.items,
      paymentNoteId: undefined as any,
      discountValue: updatedPurchaseOrder.discountValue,
      discountPercent: updatedPurchaseOrder.discountPercent,
      discountType: updatedPurchaseOrder.discountType
    }
    if (updatedPurchaseOrder.paymentNoteId) {
      invoice.paymentNoteId = updatedPurchaseOrder.paymentNoteId;
    }
    const createdInvoiceDoc = await InvoiceCollection.create(invoice);
    await invoiceService.invoiceAutoIncrease(createdInvoiceDoc)
    const createdInvoice = createdInvoiceDoc['_doc']
    logger.info(`Created Invoice Code[${createdInvoice.code}]`);
  }
  
  return get(updatedPurchaseOrderDoc, '_doc')
}

const initCode = (prefix: string, seq: number) => {
  let s = '000000000' + seq;
  return prefix + s.substr(s.length - 6);
}

export default {
  createInvoice,
  createPurchaseOrder,
  checkBatchQuantity,
  updatePurchaseOrder
};
