import loggerHelper from '@utils/logger.util';
import {get, isNil} from 'lodash';
import PurchaseOrderCollection from './purchaseOrder.collection';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import InventoryTransactionCollection from '@modules/inventory-transaction/inventory-transaction.collection';
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';
import {PAYMENT_NOTE_TYPE, PaymentNoteConstants} from '@modules/payment-note/constant';
import BatchCollection from '@modules/batch/batch.collection';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';
import paymentNoteService from '@modules/payment-note/payment-note.service';

const logger = loggerHelper.getLogger('purchaseOrder.service');

const createPurchaseOrder = async (purchaseOrderInfo: any) => {

  const payment = purchaseOrderInfo.payment;
  const branchId = purchaseOrderInfo.branchId;
  const partnerId = purchaseOrderInfo.partnerId;
  const supplierId = purchaseOrderInfo.supplierId;

  const paymentNote = await createPurchasePaymentNote(payment, purchaseOrderInfo, PAYMENT_NOTE_TYPE.PAYMENT);

  const purchaseOrder = {
    purchaseOrderType: purchaseOrderInfo.purchaseOrderType,
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
    involvedBy: purchaseOrderInfo.involvedBy,
    purchasedAt: purchaseOrderInfo.purchasedAt,
    paymentNoteIds: undefined as any,
    totalQuantity: undefined as any,
    subTotal: undefined as any,
    totalPayment: undefined as any,
    currentDebt: undefined as any
  }

  if (!isNil(paymentNote)) {
    purchaseOrder.paymentNoteIds = [get(paymentNote, '_doc._id')];
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseOrderInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map((batch: any) => batch.quantity).reduce((a: any, b: any) => a + b, 0);
  })
  purchaseOrder.totalQuantity = totalQuantity;

  const paymentSummary = await calculateOrderPurchasePaymentSummary(purchaseOrderInfo);
  purchaseOrder.subTotal = paymentSummary.subtotal;
  purchaseOrder.currentDebt = paymentSummary.currentDebt > 0 ? paymentSummary.currentDebt : 0;
  purchaseOrder.totalPayment = paymentSummary.totalPayment;

  const createdPurchaseOrder = await PurchaseOrderCollection.create(purchaseOrder);
  createdPurchaseOrder.code = initCode('PN', createdPurchaseOrder.purchaseOrderCodeSequence);
  await createdPurchaseOrder.save()
  logger.info(`Created Purchase receipt with code[${createdPurchaseOrder.code}]`)

  const purchaseOrderId = get(createdPurchaseOrder, '_doc._id');

  if (paymentNote) {
    paymentNote.referenceDocId = purchaseOrderId;
    paymentNote.save();
  }

  await createInventoryTransaction(purchaseOrderInfo, supplierId, partnerId, branchId, purchaseOrderId, createdPurchaseOrder);

  await createSupplierCashbackPaymentNote(paymentSummary, purchaseOrderInfo, createdPurchaseOrder);

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
        const batchDoc = await BatchCollection.findOne({_id: batch.batchId}).lean().exec();
        if (!isNil(batchDoc)) {
          await BatchCollection.findOneAndUpdate({_id: batch.batchId}, {
            $set: {
              quantity: batchDoc.quantity + batch.quantity
            }
          }).exec();
        }
        inventoryTransactionIds.push(get(inventoryTransaction, '_doc._id'));
      }
    });

    purchaseOrderDoc.inventoryTransactions = inventoryTransactionIds;
    await purchaseOrderDoc.save()

  }
}

async function createPurchasePaymentNote(payment: any, purchaseOrderInfo: any, type: string, purchaseOrderId: string = undefined) {
  const { branchId, supplierId } = purchaseOrderInfo;
  if (payment && !isNil(payment.amount) && payment.amount > 0) {
    const paymentNoteInfo = {
      type,
      branchId,
      supplierId,
      involvedById: purchaseOrderInfo.involvedById,
      createdById: purchaseOrderInfo.createdBy,
      paymentMethod: payment.method,
      paymentDetail: payment.detail,
      paymentAmount: payment.amount,
      totalPayment: payment.totalPayment,
      transactionType: PaymentNoteConstants.PCPN.symbol,
      referenceDocName: PaymentNoteConstants.PCPN.referenceDocName,
      referenceDocId: purchaseOrderId
    };

    let paymentNote = await PaymentNoteCollection.create(paymentNoteInfo);
    paymentNote.code = initCode(PaymentNoteConstants.PCPN.symbol, paymentNote.paymentNoteCodeSequence);
    await paymentNote.save();
    logger.info(`Created payment note with code[${paymentNote.code}] branchId[${branchId}] amount[${payment.amount}] type[${type}]`)
    return paymentNote;
  }
  return null;
}

const updatePurchaseOrder = async (id: string, purchaseOrderInfo: any) => {

  const payment = purchaseOrderInfo.payment;
  const branchId = purchaseOrderInfo.branchId;
  const partnerId = purchaseOrderInfo.partnerId;
  const supplierId = purchaseOrderInfo.supplierId;

  const paymentNote = await createPurchasePaymentNote(payment, purchaseOrderInfo, PAYMENT_NOTE_TYPE.PAYMENT, id);

  const willBeUpdatePurchaseOrder = {
    purchaseOrderType: purchaseOrderInfo.purchaseOrderType,
    purchaseOrderItems: purchaseOrderInfo.purchaseItems,
    totalProduct: purchaseOrderInfo.purchaseItems.length,
    discountValue: purchaseOrderInfo.discountValue,
    discountPercent: purchaseOrderInfo.discountPercent,
    discountType: purchaseOrderInfo.discountType,
    status: purchaseOrderInfo.status,
    note: purchaseOrderInfo.note,
    involvedById: purchaseOrderInfo.involvedById,
    involvedBy: purchaseOrderInfo.involvedBy,
    paymentNoteIds: undefined as any,
    totalQuantity: undefined as any,
    subTotal: undefined as any,
    totalPayment: undefined as any,
    currentDebt: undefined as any,
    purchasedAt: purchaseOrderInfo.purchasedAt
  }

  // Update list PaymentNote ID 
  const existedOrder = await PurchaseOrderCollection.findById(id).lean().exec();
  willBeUpdatePurchaseOrder.paymentNoteIds = existedOrder.paymentNoteIds || [];
  if (!isNil(paymentNote)) {
    willBeUpdatePurchaseOrder.paymentNoteIds.push(get(paymentNote, '_doc._id'));
  }

  let totalQuantity = 0;
  await asyncForEach(purchaseOrderInfo.purchaseItems, async item => {
    totalQuantity += item.batches.map((batch: any) => batch.quantity).reduce((a: any, b: any) => a + b, 0);
  })
  willBeUpdatePurchaseOrder.totalQuantity = totalQuantity;

  const paymentSummary = await calculateOrderPurchasePaymentSummary(purchaseOrderInfo, id);
  willBeUpdatePurchaseOrder.subTotal = paymentSummary.subtotal;
  willBeUpdatePurchaseOrder.currentDebt = paymentSummary.currentDebt > 0 ? paymentSummary.currentDebt : 0;
  willBeUpdatePurchaseOrder.totalPayment = paymentSummary.totalPayment;

  const updatedPurchaseOrder = await PurchaseOrderCollection
    .findOneAndUpdate({_id: purchaseOrderInfo.purchaseOrderId}, {
      $set: {...willBeUpdatePurchaseOrder}
    }, {new: true}).exec();

  // Create inventory transaction
  // ONLY when status is changed from DRAFT => COMPLETED
  if (existedOrder.status === PURCHASE_ORDER_STATUS.DRAFT && purchaseOrderInfo.status === PURCHASE_ORDER_STATUS.COMPLETED) {
    await createInventoryTransaction(purchaseOrderInfo, supplierId, partnerId, branchId, id, updatedPurchaseOrder);
    await createSupplierCashbackPaymentNote(paymentSummary, purchaseOrderInfo, updatedPurchaseOrder);
  }

  return await PurchaseOrderCollection.findById(id).lean().exec();
};

/**
 * Return total amount that need to pay supplier.
 * @param purchaseOrderInfo
 * @param id
 */
const calculateOrderPurchasePaymentSummary = async (purchaseOrderInfo: any, id: string = undefined) => {
  const subtotal = purchaseOrderInfo.purchaseItems.reduce((a: any, b: { total: any; }) => a + b.total, 0);
  const discountValue = purchaseOrderInfo.discountValue || 0;
  const totalPayment = subtotal - discountValue;
  let totalPaid = 0;
  if (id) {
    const purchaseOrder = await findById({_id: id});
    if (purchaseOrder) {
      totalPaid += purchaseOrder.paymentNotes.reduce((a: any, b: { paymentAmount: any; }) => a + b.paymentAmount, 0);
    }
  }
  if (purchaseOrderInfo.payment && purchaseOrderInfo.payment.amount) {
    totalPaid += purchaseOrderInfo.payment.amount;
  }
  return {
    subtotal,
    totalPayment,
    totalPaid,
    currentDebt: totalPayment - totalPaid
  };
}

/**
 * Create a receipt payment note IF we paid more than totalPayment
 * @param paymentSummary
 * @param purchaseOrderInfo
 * @param savedPurchaseOrder
 */
async function createSupplierCashbackPaymentNote(paymentSummary: any, purchaseOrderInfo: any, savedPurchaseOrder: any) {
  if (paymentSummary.currentDebt > 0) {
    return;
  }
  const purchaseOrderId = purchaseOrderInfo.purchaseOrderId;

  const receiptPaymentNote = await createPurchasePaymentNote({
    amount: Math.abs(paymentSummary.currentDebt)
  }, purchaseOrderInfo, PAYMENT_NOTE_TYPE.RECEIPT, get(savedPurchaseOrder, '_doc._id'));
  if (!receiptPaymentNote) {
    return;
  }

  const receiptPaymentNoteId = get(receiptPaymentNote, '_doc._id');
  let paymentNoteIds;
  if (get(savedPurchaseOrder, '_doc.paymentNoteIds').length > 0) {
    paymentNoteIds = get(savedPurchaseOrder, '_doc.paymentNoteIds');
    paymentNoteIds.push(receiptPaymentNoteId);
  } else {
    paymentNoteIds = [receiptPaymentNoteId]
  }

  await PurchaseOrderCollection
    .findOneAndUpdate({_id: purchaseOrderId}, {
      $set: {paymentNoteIds}
    }, {new: true}).exec();
}

const fetchPurchaseOrders = async (queryInput: any, options: any) => {
  let query = {
    deletedAt: null
  } as any;
  if (queryInput.keyword) {
    query.code = {
      $regex: '.*' + queryInput.keyword + '.*', $options: 'i'
    }
  }
  const purchaseOrders = await PurchaseOrderCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    populate: [
      {path: 'purchaseOrderItems.product'},
      {
        path: 'purchaseOrderItems.productVariant',
        strictPopulate: false,
        populate: 'unit'
      },
      {path: 'purchaseOrderItems.batches.batch'},
      {path: 'supplier'},
      {path: 'branch'},
      {path: 'partner'},
      {
        path: 'paymentNotes',
        strictPopulate: false,
        populate: {path: 'createdBy', select: '-password'}
      }
    ],
    lean: true
  });
  const {docs, ...rest} = purchaseOrders
  const resultDocs = [];
  for (const doc of docs) {
    await setPurchaseOrderFullBatches(doc);
    resultDocs.push(doc);
  }
  const summary = await summaryPurchaseOrders(query);
  return {
    docs: resultDocs,
    ...rest,
    summary
  };
}

const summaryPurchaseOrders = async (query: any) => {
  const summaryPurchaseOrders = await PurchaseOrderCollection.aggregate([
    {
      $match: query
    },
    {
      $project: {
        _id: 0,
        currentDebt: 1
      }
    },
    {
      $group: {
        _id: null,
        totalDebt: {
          $sum: {
            $toDouble: '$currentDebt'
          }
        }
      }
    }
  ]).exec();
  if (summaryPurchaseOrders.length > 0) {
    const summary = summaryPurchaseOrders[0];
    return {
      totalDebt: summary.totalDebt
    }
  }
  return {
    totalDebt: 0
  }
}

const getPurchaseOrder = async (query: any) => {
  return await PurchaseOrderCollection.findOne(query).exec();
};

const findById = async (query: any) => {
  const result = await PurchaseOrderCollection.findOne(query)
    .populate('purchaseOrderItems.product')
    .populate({
      path: 'purchaseOrderItems.productVariant',
      strictPopulate: false,
      populate: 'unit'
    })
    .populate('purchaseOrderItems.batches.batch')
    .populate('supplier')
    .populate('branch')
    .populate('partner')
    .populate('fullBatches')
    .populate({
      path: 'paymentNotes',
      strictPopulate: false,
      populate: {path: 'createdBy', select: '-password'}
    })
    .lean()
    .exec();
  await setPurchaseOrderFullBatches(result);
  return result;
}

/**
 * 1. Delete PurchaseOrder and set CANCELED status
 * 2. Delete and restore quantity InventoryTransaction
 * 3. Remove PaymentNote if necessary
 * @param purchaseOrderId
 * @param removePaymentNote
 */
const deletePurchaseOrder = async (purchaseOrderId: string, removePaymentNote: boolean) => {
  const updateInfo = {
    status: PURCHASE_ORDER_STATUS.CANCELED,
    deletedAt: new Date()
  }
  const deletedPurchaseOrder = await PurchaseOrderCollection.findByIdAndUpdate(purchaseOrderId, {
    $set: updateInfo
  }, {
    new: true
  }).lean();
  const inventoryTransactions = deletedPurchaseOrder.inventoryTransactions || [];
  for (const inventoryTransactionId of inventoryTransactions) {
    await inventoryTransactionService.cancelInventoryTransaction(inventoryTransactionId)
  }
  if (removePaymentNote) {
    const paymentNoteIds = deletedPurchaseOrder.paymentNoteIds || [];
    for (const paymentNoteId of paymentNoteIds) {
      await paymentNoteService.deletePaymentNote({_id: paymentNoteId})
    }
  }
  return true;
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
  findById,
  deletePurchaseOrder
};
