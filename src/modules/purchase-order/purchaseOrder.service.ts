import loggerHelper from '@utils/logger.util';
import {clone, get, isNil, map} from 'lodash';
import PurchaseOrderCollection from './purchaseOrder.collection';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import InventoryTransactionCollection from '@modules/inventory-transaction/inventory-transaction.collection';
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE, PaymentNoteConstants} from '@modules/payment-note/constant';
import BatchCollection from '@modules/batch/batch.collection';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';

const logger = loggerHelper.getLogger('purchaseOrder.service');

const createPurchaseOrder = async (purchaseOrderInfo: any) => {

  const payment = purchaseOrderInfo.payment;
  const branchId = purchaseOrderInfo.branchId;
  const partnerId = purchaseOrderInfo.partnerId;
  const supplierId = purchaseOrderInfo.supplierId;

  const paymentNote = await createPaymentNote(payment, branchId, supplierId, purchaseOrderInfo);

  const purchaseOrder = {
    purchaseOrderItems: purchaseOrderInfo.purchaseItems,
    totalProduct: purchaseOrderInfo.purchaseItems.length,
    discountValue: purchaseOrderInfo.discountValue,
    discountPercent: purchaseOrderInfo.discountPercent,
    discountType: purchaseOrderInfo.discountType,
    partnerId,
    branchId,
    status: purchaseOrderInfo.status,
    supplierId,
    note: purchaseOrderInfo.note,
    involvedById: purchaseOrderInfo.involvedById,
    purchasedAt: purchaseOrderInfo.purchasedAt,
    paymentNoteIds: undefined as any,
    totalQuantity: undefined as any,
    subTotal: undefined as any
  }

  if (!isNil(paymentNote)) {
    purchaseOrder.paymentNoteIds = [get(paymentNote, '_doc._id')];
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseOrderInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map((batch: any) => batch.quantity).reduce((a: any, b: any) => a + b, 0);
  })
  purchaseOrder.totalQuantity = totalQuantity;
  purchaseOrder.subTotal = purchaseOrderInfo.purchaseItems.reduce((a: any, b: any) => a + b.price, 0)

  const createdPurchaseOrder = await PurchaseOrderCollection.create(purchaseOrder);
  createdPurchaseOrder.code = initCode('PN', createdPurchaseOrder.purchaseOrderCodeSequence);
  await createdPurchaseOrder.save()
  logger.info(`Created Purchase receipt with code[${createdPurchaseOrder.code}]`)

  const purchaseOrderId = get(createdPurchaseOrder, '_doc._id');
  paymentNote.referenceDocId = purchaseOrderId;
  paymentNote.save();

  await createInventoryTransaction(purchaseOrderInfo, supplierId, partnerId, branchId, purchaseOrderId, createdPurchaseOrder);

  return {
    ...get(createdPurchaseOrder, '_doc', {}),
  };
};


async function createInventoryTransaction(purchaseOrderInfo: any, supplierId: any, partnerId: any, 
                                          branchId: any, purchaseOrderId: string, purchaseOrderDoc: any) {
  if (purchaseOrderInfo.status === PURCHASE_ORDER_STATUS.COMPLETED) {
    const inventoryTransactionIds: string[] = [];
    await asyncForEach(purchaseOrderInfo.purchaseItems, async (item) => {
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
          referenceDocId: purchaseOrderId
        }
        const inventoryTransaction = await InventoryTransactionCollection.create(inventoryTransactionInfo);
        const batchDoc = await BatchCollection.findOne({_id: batch.batchId}).exec();
        if (!isNil(batchDoc)) {
          await BatchCollection.findOneAndUpdate({_id: batch.batchId}, {
            quantity: get(batchDoc, '_doc').quantity + batch.quantity
          }).exec();
        }
        inventoryTransactionIds.push(get(inventoryTransaction, '_doc._id'));
      }
    });

    purchaseOrderDoc.inventoryTransactions = inventoryTransactionIds;
    await purchaseOrderDoc.save()
    
  }
}

async function createPaymentNote(payment: any, branchId: any, supplierId: any, purchaseOrderInfo: any) {
  if (payment.amount && payment.amount > 0) {
    const paymentNoteInfo = {
      type: PAYMENT_NOTE_TYPE.PAYMENT,
      branchId,
      supplierId,
      involvedById: purchaseOrderInfo.involvedById,
      createdById: purchaseOrderInfo.createdBy,
      paymentMethod: payment.method,
      paymentDetail: payment.detail,
      paymentAmount: payment.amount,
      totalPayment: payment.totalPayment,
      transactionType: PaymentNoteConstants.PCPN.symbol,
      referenceDocName: PaymentNoteConstants.PCPN.referenceDocName
    };

    let paymentNote = await PaymentNoteCollection.create(paymentNoteInfo);
    paymentNote.code = initCode(PaymentNoteConstants.PCPN.symbol, paymentNote.paymentNoteCodeSequence);
    await paymentNote.save();
    logger.info(`Created payment note with code[${paymentNote.code}]`)
    return paymentNote;
  }
  return null;
}

const updatePurchaseOrder = async (purchaseOrderInfo: any) => {

  const payment = purchaseOrderInfo.payment;
  const branchId = purchaseOrderInfo.branchId;
  const partnerId = purchaseOrderInfo.partnerId;
  const supplierId = purchaseOrderInfo.supplierId;

  const paymentNote = await createPaymentNote(payment, branchId, supplierId, purchaseOrderInfo);

  const willBeUpdatePurchaseOrder = {
    purchaseOrderItems: purchaseOrderInfo.purchaseItems,
    totalProduct: purchaseOrderInfo.purchaseItems.length,
    discountValue: purchaseOrderInfo.discountValue,
    discountPercent: purchaseOrderInfo.discountPercent,
    discountType: purchaseOrderInfo.discountType,
    status: purchaseOrderInfo.status,
    note: purchaseOrderInfo.note,
    involvedById: purchaseOrderInfo.involvedById,
    paymentNoteIds: undefined as any,
    totalQuantity: undefined as any,
    subTotal: undefined as any,
    purchasedAt: purchaseOrderInfo.purchasedAt
  }

  const purchaseOrderDoc = await PurchaseOrderCollection.findOne({_id: purchaseOrderInfo.purchaseOrderId}).exec();
  const existed = get(purchaseOrderDoc, '_doc');
  const existedStatus = clone(existed.status);
  if (!isNil(paymentNote) && existed.paymentNoteIds.length > 0) {
    existed.paymentNoteIds.push(get(paymentNote, '_doc._id'));
    willBeUpdatePurchaseOrder.paymentNoteIds = existed.paymentNoteIds
  } else if (!isNil(paymentNote)) {
    willBeUpdatePurchaseOrder.paymentNoteIds = [get(paymentNote, '_doc._id')]
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseOrderInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map((batch: any) => batch.quantity).reduce((a: any, b: any) => a + b, 0);
  })
  willBeUpdatePurchaseOrder.totalQuantity = totalQuantity;
  willBeUpdatePurchaseOrder.subTotal = purchaseOrderInfo.purchaseItems.reduce((a: any, b: { price: any; }) => a + b.price, 0)

  const updatedPurchaseOrder = await PurchaseOrderCollection
    .findOneAndUpdate({_id: purchaseOrderInfo.purchaseOrderId}, willBeUpdatePurchaseOrder).exec();
  const purchaseOrderId = get(updatedPurchaseOrder, '_doc._id');

  if (purchaseOrderInfo.status === PURCHASE_ORDER_STATUS.COMPLETED && existedStatus === PURCHASE_ORDER_STATUS.DRAFT) {
    await createInventoryTransaction(purchaseOrderInfo, supplierId, partnerId, branchId, purchaseOrderId, updatedPurchaseOrder);
  }

  const resultDoc = await PurchaseOrderCollection.findOne({_id: purchaseOrderId})
  return {
    ...get(resultDoc, '_doc', {}),
  };
};

const fetchPurchaseOrders = async (queryInput: any, options: any) => {
  let query = {} as any;
  if (queryInput.keyword) {
    query['$text'] = {$search: queryInput.keyword}
  }
  const purchaseOrders = await PurchaseOrderCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    populate: [
      { path: 'purchaseOrderItems.product' },
      { path: 'purchaseOrderItems.productVariant' },
      { path: 'purchaseOrderItems.batches.batch' },
      { path: 'supplier' },
      { path: 'branch' },
      { path: 'partner' }
    ],
    lean: true
  });
  const {docs, ...rest} = purchaseOrders
  const resultDocs = [];
  for (const doc of docs) {
    await setPurchaseOrderFullBatches(doc);
    resultDocs.push(doc);
  }
  return {
    docs: resultDocs,
    ...rest
  };
}

const getPurchaseOrder = async (query: any) => {
  return await PurchaseOrderCollection.findOne(query).exec();
};

const findById = async (query: any) => {
  const result = await PurchaseOrderCollection.findOne(query)
    .populate('purchaseOrderItems.product')
    .populate('purchaseOrderItems.productVariant')
    .populate('purchaseOrderItems.batches.batch')
    .populate('supplier')
    .populate('branch')
    .populate('partner')
    .populate('fullBatches')
    .lean()
    .exec();
  await setPurchaseOrderFullBatches(result);
  return result;
}

const setPurchaseOrderFullBatches = async (doc: any) => {
  if (doc && doc?.purchaseOrderItems) {
    for (const item of doc.purchaseOrderItems) {
      item.fullBatches = await BatchCollection.find({variantId: item.variantId}).lean().exec();
    }
  }
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
  createPurchaseOrder,
  getPurchaseOrder,
  updatePurchaseOrder,
  fetchPurchaseOrders,
  findById
};
