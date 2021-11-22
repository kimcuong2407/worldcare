import loggerHelper from '@utils/logger.util';
import {get, isNil, clone, map} from 'lodash';
import PurchaseReceiptCollection from './purchaseReceipt.collection';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import InventoryTransactionCollection from '@modules/inventory-transaction/inventory-transaction.collection';
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE} from '@modules/payment-note/constant';
import LotCollection from '@modules/batch/batch.collection';
import {PURCHASE_RECEIPT_STATUS} from "@modules/purchase-receipt/constant";
import SupplierCollection from "@modules/supplier/supplier.collection";

const logger = loggerHelper.getLogger('purchaseReceipt.service');

const createPurchaseReceipt = async (purchaseReceiptInfo: any) => {

  const payment = purchaseReceiptInfo.payment;
  const branchId = purchaseReceiptInfo.branchId;
  const partnerId = purchaseReceiptInfo.partnerId;
  const supplierId = purchaseReceiptInfo.supplierId;

  const paymentNoteId = await createPaymentNote(payment, branchId, supplierId, purchaseReceiptInfo);

  const purchaseReceipt = {
    purchaseReceiptItems: purchaseReceiptInfo.purchaseItems,
    totalProduct: purchaseReceiptInfo.purchaseItems.length,
    discountValue: purchaseReceiptInfo.discountValue,
    discountPercent: purchaseReceiptInfo.discountPercent,
    discountType: purchaseReceiptInfo.discountType,
    partnerId,
    branchId,
    status: purchaseReceiptInfo.status,
    supplierId,
    note: purchaseReceiptInfo.note,
    involvedById: purchaseReceiptInfo.involvedById
  }

  if (paymentNoteId) {
    purchaseReceipt.paymentNoteIds = [paymentNoteId];
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseReceiptInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map(batch => batch.quantity).reduce((a, b) => a + b, 0);
  })
  purchaseReceipt.totalQuantity = totalQuantity;
  purchaseReceipt.subTotal = purchaseReceiptInfo.purchaseItems.reduce((a, b) => a + b.price, 0)

  const createdPurchaseReceipt = await PurchaseReceiptCollection.create(purchaseReceipt);
  createdPurchaseReceipt.code = initCode('PN', createdPurchaseReceipt.purchaseReceiptCodeSequence);
  await createdPurchaseReceipt.save()
  logger.info(`Created Purchase receipt with code[${createdPurchaseReceipt.code}]`)

  const purchaseReceiptId = get(get(createdPurchaseReceipt, '_doc'), '_id');

  await createInventoryTransaction(purchaseReceiptInfo, supplierId, partnerId, branchId, purchaseReceiptId, createdPurchaseReceipt);

  return {
    ...get(createdPurchaseReceipt, '_doc', {}),
  };
};


async function createInventoryTransaction(purchaseReceiptInfo: any, supplierId: any, partnerId: any, 
                                          branchId: any, purchaseReceiptId: string, purchaseReceiptDoc: any) {
  if (purchaseReceiptInfo.status === PURCHASE_RECEIPT_STATUS.COMPLETED) {
    const inventoryTransactionIds: string[] = [];
    await asyncForEach(purchaseReceiptInfo.purchaseItems, async (item) => {
      for (const batch of item.batches) {
        const inventoryTransactionInfo = {
          type: INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT,
          supplierId,
          partnerId,
          branchId,
          productId: item.productId,
          variantId: item.variantId,
          batchId: batch.batchId,
          quantity: batch.quantity,
          referenceDocId: purchaseReceiptId
        }
        const inventoryTransaction = await InventoryTransactionCollection.create(inventoryTransactionInfo);
        const batchDoc = await LotCollection.findOne({_id: batch.batchId}).exec();
        if (!isNil(batchDoc)) {
          await LotCollection.findOneAndUpdate({_id: batch.batchId}, {
            quantity: get(batchDoc, '_doc').quantity + batch.quantity
          }).exec();
        }
        inventoryTransactionIds.push(get(get(inventoryTransaction, '_doc'), '_id'));
      }
    });

    purchaseReceiptDoc.inventoryTransactions = inventoryTransactionIds;
    await purchaseReceiptDoc.save()
    
  }
}

async function createPaymentNote(payment: any, branchId: any, supplierId: any, purchaseReceiptInfo: any) {
  if (payment.amount && payment.amount > 0) {
    const paymentNoteInfo = {
      type: PAYMENT_NOTE_TYPE.PAYMENT,
      branchId,
      supplierId,
      involvedById: purchaseReceiptInfo.involvedById,
      createdById: purchaseReceiptInfo.createdBy,
      paymentMethod: payment.method,
      paymentDetail: payment.detail,
      paymentAmount: payment.amount,
      totalPayment: payment.totalPayment,
    };

    let paymentNote = await PaymentNoteCollection.create(paymentNoteInfo);
    paymentNote.code = initCode('PCPN', paymentNote.paymentNoteCodeSequence);
    await paymentNote.save();
    const paymentNoteId = get(get(paymentNote, '_doc'), '_id');
    logger.info(`Created payment note with code[${paymentNote.code}]`)
    return paymentNoteId;
  }
  return null;
}

const updatePurchaseReceipt = async (purchaseReceiptInfo: any) => {

  const payment = purchaseReceiptInfo.payment;
  const branchId = purchaseReceiptInfo.branchId;
  const partnerId = purchaseReceiptInfo.partnerId;
  const supplierId = purchaseReceiptInfo.supplierId;

  const paymentNoteId = await createPaymentNote(payment, branchId, supplierId, purchaseReceiptInfo);

  const willBeUpdatePurchaseReceipt = {
    purchaseReceiptItems: purchaseReceiptInfo.purchaseItems,
    totalProduct: purchaseReceiptInfo.purchaseItems.length,
    discountValue: purchaseReceiptInfo.discountValue,
    discountPercent: purchaseReceiptInfo.discountPercent,
    discountType: purchaseReceiptInfo.discountType,
    status: purchaseReceiptInfo.status,
    note: purchaseReceiptInfo.note,
    involvedById: purchaseReceiptInfo.involvedById,
  }

  const purchaseReceiptDoc = await PurchaseReceiptCollection.findOne({_id: purchaseReceiptInfo.purchaseReceiptId}).exec();
  const existed = get(purchaseReceiptDoc, '_doc');
  const existedStatus = clone(existed.status);
  if (paymentNoteId && existed.paymentNoteIds.length > 0) {
    existed.paymentNoteIds.push(paymentNoteId);
    willBeUpdatePurchaseReceipt.paymentNoteIds = existed.paymentNoteIds
  } else if (paymentNoteId) {
    willBeUpdatePurchaseReceipt.paymentNoteIds = [paymentNoteId]
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseReceiptInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map(batch => batch.quantity).reduce((a, b) => a + b, 0);
  })
  willBeUpdatePurchaseReceipt.totalQuantity = totalQuantity;
  willBeUpdatePurchaseReceipt.subTotal = purchaseReceiptInfo.purchaseItems.reduce((a, b) => a + b.price, 0)

  const updatedPurchaseReceipt = await PurchaseReceiptCollection
    .findOneAndUpdate({_id: purchaseReceiptInfo.purchaseReceiptId}, willBeUpdatePurchaseReceipt).exec();
  const purchaseReceiptId = get(get(updatedPurchaseReceipt, '_doc'), '_id');

  if (purchaseReceiptInfo.status === PURCHASE_RECEIPT_STATUS.COMPLETED && existedStatus === PURCHASE_RECEIPT_STATUS.DRAFT) {
    await createInventoryTransaction(purchaseReceiptInfo, supplierId, partnerId, branchId, purchaseReceiptId, updatedPurchaseReceipt);
  }

  const resultDoc = await PurchaseReceiptCollection.findOne({_id: purchaseReceiptId})
  return {
    ...get(resultDoc, '_doc', {}),
  };
};

const fetchPurchaseReceipts = async (queryInput: any, options: any) => {
  let query = {};
  if (queryInput.keyword) {
    query['$text'] = {$search: queryInput.keyword}
  }
  const purchaseReceipts = await PurchaseReceiptCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    populate: [
      { path: 'purchaseReceiptItems.product', select: '_id name' },
      { path: 'purchaseReceiptItems.productVariant', select: '_id name' },
      { path: 'supplier'},
    ],
  });
  const {docs, ...rest} = purchaseReceipts
  return {
    docs: map(docs, doc => {
      return get(doc, '_doc')
    }),
    ...rest
  };
}

const getPurchaseReceipt = async (query: any) => {
  return await PurchaseReceiptCollection.findOne(query).exec();
};

const findById = async (query: any) => {
  return await PurchaseReceiptCollection.findOne(query)
    .populate('purchaseReceiptItems.product')
    .populate('purchaseReceiptItems.productVariant')
    .populate('supplier')
    .exec();
}

const initCode = (prefix: string, seq: number) => {
  let s = '000000000' + seq;
  return prefix + s.substr(s.length - 6);
}

const asyncForEach = async (array: string | any[], callback: (arg0: any, arg1: number, arg2: any) => any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export default {
  createPurchaseReceipt,
  getPurchaseReceipt,
  updatePurchaseReceipt,
  fetchPurchaseReceipts,
  findById
};
