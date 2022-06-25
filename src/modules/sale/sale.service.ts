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
import paymentNoteService from '@app/modules/payment-note/paymentNote.service';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';
import {SaleItemModel} from '@modules/sale/sale.model';

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
const createInvoice = async (invoiceInfo: any, isUpdating: boolean = false) => {
  logger.info('Start create invoice. ' + JSON.stringify(invoiceInfo));

  const paymentNoteIds: any[] = [];
  let totalPayment = 0;

  // 0. Check if invoice is creating bases on a sale order.
  if (!isUpdating && !isNil(invoiceInfo.saleOrderId)) {
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
    ...mapInvoiceInfo(invoiceInfo),
    status: INVOICE_STATUS.COMPLETED,
    prescriptionId: undefined as any,
    total: 0 as number,
    paymentNoteIds: isUpdating ? invoiceInfo.paymentNoteIds : paymentNoteIds,
    totalPayment: isUpdating ? invoiceInfo.totalPayment : totalPayment,
  }

  if (invoiceInfo.isPrescriptionFilled && !isNil(invoiceInfo.prescription)) {
    if (invoiceInfo.prescription._id) {
      invoice.prescriptionId = invoiceInfo.prescription._id
    } else {
      invoiceInfo.prescription.branchId = invoiceInfo.branchId;
      const prescription = await prescriptionService.persistPrescription(invoiceInfo.prescription);
      invoice.prescriptionId = get(prescription, '_id')
    }
    logger.info(`set invoice.prescriptionId=${invoice.prescriptionId}`);
  }

  await setInvoiceTotalAndSnapshotDetail(invoice);

  const createdInvoiceDoc = await InvoiceCollection.create(invoice);
  await invoiceService.invoiceAutoIncrease(createdInvoiceDoc, invoiceInfo.code)
  const createdInvoice = createdInvoiceDoc['_doc']
  logger.info(`Created Invoice Code[${createdInvoice.code}]`);

  // update SaleOrder status and invoiceId
  if (!isNil(invoiceInfo.saleOrderId)) {
    await updateSaleOrderStatusAndInvoiceId(isUpdating, invoiceInfo, createdInvoice);
  }

  // 2. Create payment note.
  await createInvoicePaymentNote(invoiceInfo, createdInvoice, totalPayment);

  // 3. Create inventory transaction.
  await createInventoryTransaction(INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT, invoiceInfo, createdInvoice['_id']);

  logger.info(`Creating invoice successfully. Code=${createdInvoice.code} ID=${createdInvoice._id}`)
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
  await validateSaleInput(saleOrderInfo);

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

/**
 * 1. Cancel the old invoice and create a new invoice
 * 2. Link payment-notes of the old invoice to the new invoice
 * 3. Cancel inventory-transaction of the old invoice
 * 4. Check batch quantity
 * 5. Create invoice and new payment
 * 
 * @param id
 * @param invoiceInfo
 */
const updateInvoice = async (id: string, invoiceInfo: any) => {
  logger.info(`Updating invoice id=${id} invoiceInfo=${JSON.stringify(invoiceInfo)}`)
  const processingInvoice = await InvoiceCollection.findById(id).populate('paymentNotes').lean().exec();
  if (!processingInvoice) {
    throw new ValidationFailedError('Invoice is not found.');
  }
  if (processingInvoice.status === INVOICE_STATUS.CANCELED) {
    throw new ValidationFailedError('Can not updated canceled Invoice.');
  }

  const {branchId, partnerId} = invoiceInfo;

  // Check batch quantity
  await checkBatchQuantityForUpdatingInvoice(invoiceInfo.items, processingInvoice.invoiceDetail);

  // cancel invoice
  await invoiceService.cancelInvoice(id, branchId, false);

  // Create new invoice
  invoiceInfo.totalPayment = processingInvoice.totalPayment || 0;
  invoiceInfo.paymentNoteIds = processingInvoice.paymentNoteIds || [];
  invoiceInfo.code = processingInvoice.code;

  const updatedInvoice = await createInvoice(invoiceInfo, true);
  logger.info(`Updated invoice id=${id}. new invoice has been created. ${updatedInvoice._id} invoiceInfo=${JSON.stringify(invoiceInfo)}`)
  return updatedInvoice;
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

const mapInvoiceInfo = (invoiceInfo: any) => {
  return {
    customerId: invoiceInfo.customerId,
    branchId: invoiceInfo.branchId,
    partnerId: invoiceInfo.partnerId,
    saleChannel: invoiceInfo.saleChannel,
    soldById: invoiceInfo.soldById,
    createdById: invoiceInfo.createdBy,
    invoiceDetail: invoiceInfo.items,
    discountValue: invoiceInfo.discountValue,
    discountPercent: invoiceInfo.discountPercent,
    discountType: invoiceInfo.discountType,
    involvedBy: invoiceInfo.involvedBy,
    purchasedAt: invoiceInfo.purchasedAt,
    saleOrderId: invoiceInfo.saleOrderId,
  }
}

async function setInvoiceTotalAndSnapshotDetail(invoice: any) {
  for (const item of invoice.invoiceDetail) {
    item.variant = await ProductVariantCollection.findOne({_id: item.variantId})
      .populate('unit').lean().exec();
    item.batch = await BatchCollection.findOne({_id: item.batchId}).lean().exec();
    item.product = await ProductCollection.findOne({_id: item.productId}).lean().exec();
    // Calculate invoice's total
    invoice.total += item.price * item.quantity;
  }
}

/**
 * Create payment-note.
 * Update Invoice's payment-note data
 * @param invoiceInfo
 * @param createdInvoice
 * @param totalPayment
 */
async function createInvoicePaymentNote(invoiceInfo: any, createdInvoice: any, totalPayment: number) {
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
  return paymentNote;
}

const validateSaleInput = async (saleInput: any) => {
  logger.info('validating sale input. saleInput=' + JSON.stringify(saleInput))
  const items: SaleItemModel[] = saleInput.items;
  if (isNil(items) || items.length === 0) {
    throw new ValidationFailedError('items is not valid.');
  }
  const branchId = saleInput.branchId;
  for (const item of items) {
    if (isNil(item.variantId)) {
      throw new ValidationFailedError('items.variantId is required.');
    }
    if (isNil(item.productId)) {
      throw new ValidationFailedError('items.productId is required.');
    }
    if (isNil(item.batchId)) {
      throw new ValidationFailedError('items.batchId is required.');
    }
    if (isNil(item.quantity)) {
      throw new ValidationFailedError('items.batchId is required.');
    }
    if (isNil(item.price)) {
      throw new ValidationFailedError('items.price or items.price is required.');
    }
    if (isNil(item.cost)) {
      throw new ValidationFailedError('items.cost or items.cost is required.');
    }
    const productVariant = await ProductVariantCollection.findOne({
      _id: item.variantId,
      branchId
    }).lean().exec();
    if (isNil(productVariant)) {
      throw new ValidationFailedError('items.variantId is not valid.');
    }
    const batch = await BatchCollection.findOne({
      _id: item.batchId,
      variantId: item.variantId,
      productId: item.productId
    }).lean().exec();
    if (isNil(batch)) {
      throw new ValidationFailedError('items.batchId is not valid.');
    }
  }
}

/**
 * Update Sale order which is Invoice bases on to create.
 * @param isInvoiceUpdating is updating invoice or not
 * @param invoiceInfo
 * @param createdInvoice
 */
async function updateSaleOrderStatusAndInvoiceId(isInvoiceUpdating: boolean, invoiceInfo: any, createdInvoice: any) {
  if (isInvoiceUpdating) {
    const saleOrder = await SaleOrderCollection.findById(invoiceInfo.saleOrderId).lean().exec();
    if (saleOrder) {
      const invoiceIds = saleOrder.invoiceIds || [];
      const updatedSaleOrder = await SaleOrderCollection.findByIdAndUpdate(invoiceInfo.saleOrderId, {
        $set: {
          invoiceIds: [...invoiceIds, createdInvoice._id]
        }
      }, {new: true}).lean().exec();
      logger.info(`update saleOrder code=${updatedSaleOrder.code}: status=COMPLETED, invoiceId=${createdInvoice._id}`);
    }
  } else {
    const updatedSaleOrder = await SaleOrderCollection.findByIdAndUpdate(invoiceInfo.saleOrderId, {
      $set: {
        status: SALE_ORDER_STATUS.COMPLETED,
        invoiceIds: [createdInvoice._id]
      }
    }, {new: true}).lean().exec();
    logger.info(`update saleOrder code=${updatedSaleOrder.code}: status=COMPLETED, invoiceId=${createdInvoice._id}`);
  }
}

/**
 * Check quantity available before updating invoice
 * @param currentItems
 * @param oldItems
 */
const checkBatchQuantityForUpdatingInvoice = async (currentItems: any[], oldItems: any[]) => {
  if (!currentItems || currentItems.length === 0) {
    throw new ValidationFailedError('Invoice detail is not valid.');
  }
  for (const detailItem of currentItems) {
    const batch = await BatchCollection.findById(detailItem.batchId).lean().exec();
    if (isNil(batch)) {
      throw new ValidationFailedError(`Batch ID ${detailItem.batchId} does not exist.`);
    }
    
    const oldItemSameBatch = oldItems.find(item => item.batchId.toString() === detailItem.batchId);
    if (oldItemSameBatch) {
      if (detailItem.quantity > (batch.quantity + oldItemSameBatch.quantity)) {
        throw new ValidationFailedError(`Quantity is not valid for Batch ID ${detailItem.batchId}.`);
      }
    } else if (detailItem.quantity > batch.quantity) {
      throw new ValidationFailedError(`Quantity is not valid for Batch ID ${detailItem.batchId}.`);
    }
  }
}

export default {
  createInvoice,
  createSaleOrder,
  checkBatchQuantity,
  updateSaleOrder,
  updateInvoice,
  validateSaleInput
};
