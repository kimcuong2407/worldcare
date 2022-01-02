import loggerHelper from '@utils/logger.util';
import {get, isNil} from 'lodash';
import PurchaseOrderCollection from './purchaseReturn.collection';
import PurchaseReturnCollection from './purchaseReturn.collection';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import {INVENTORY_TRANSACTION_TYPE, InventoryTransactionConstants} from '@modules/inventory-transaction/constant';
import {PaymentNoteConstants} from '@modules/payment-note/constant';
import BatchCollection from '@modules/batch/batch.collection';
import {PURCHASE_ORDER_STATUS} from '@modules/purchase-order/constant';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';
import paymentNoteService from '@modules/payment-note/payment-note.service';
import SupplierCollection from '@modules/supplier/supplier.collection';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import {PURCHASE_RETURN_STATUS, PurchaseReturnConstants} from '@modules/purchase-return/constant';
import documentCodeUtils from '@utils/documentCode.util';
import {SUPPLIER_STATUS} from '@modules/supplier-group/constant';
import ProductVariantCollection from '@modules/product/productVariant.collection';

const logger = loggerHelper.getLogger('purchaseReturn.service');
/**
 * Create Purchase return.
 * 1. Create Purchase return
 * 2. Create payment note
 * 3. Create inventory transactions
 * 4. Update PurchaseReturn additional info
 *
 * @param info
 */
const createPurchaseReturn = async (info: any) => {
  logger.info('Start create purchase return. info=' + JSON.stringify(info))

  await validatePurchaseReturnInfo(info);
  if (info.status === PURCHASE_RETURN_STATUS.COMPLETED) {
    await checkBatchQuantity(info.purchaseReturnItems);
  }

  const payment = info.payment;

  const purchaseReturn = mapInfoToPurchaseReturn(info, false);

  const paymentSummary = await calculatePaymentSummary(info);
  purchaseReturn.subTotal = paymentSummary.subtotal;
  purchaseReturn.totalSupplierPayment = paymentSummary.totalSupplierPayment;
  purchaseReturn.totalSupplierPaid = paymentSummary.totalSupplierPaid;
  purchaseReturn.supplierDebt = paymentSummary.supplierDebt;

  const createdPurchaseReturn = await PurchaseReturnCollection.create(purchaseReturn);
  createdPurchaseReturn.code = documentCodeUtils.initDocumentCode(
    PurchaseReturnConstants.DOCUMENT_PREFIX_CODE, createdPurchaseReturn.codeSequence
  )
  await createdPurchaseReturn.save();
  logger.info(`Created Purchase return with code[${createdPurchaseReturn.code}]`)

  const purchaseReturnId = get(createdPurchaseReturn, '_doc._id');

  // Create payment note
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(payment, info,
    PaymentNoteConstants.PTTHN, true, purchaseReturnId)
  if (paymentNote) {
    createdPurchaseReturn.paymentNoteIds = [get(paymentNote, '_doc._id')];
    await createdPurchaseReturn.save();
  }

  // Create inventory transaction if Completed
  if (info.status === PURCHASE_RETURN_STATUS.COMPLETED) {
    await createPurchaseReturnInventoryTransaction(info, purchaseReturnId, createdPurchaseReturn);
  }
  return {
    ...get(createdPurchaseReturn, '_doc'),
  };
};

/**
 * Update PurchaseReturn
 * If status is not DRAFT, only update note.
 * @param id
 * @param info
 */
const updatePurchaseReturn = async (id: string, info: any) => {
  const persistedPurchaseReturn = await PurchaseReturnCollection.findOne({
    _id: id,
    branchId: info.branchId
  }).lean();

  // If status is not DRAFT, only update note.
  if (persistedPurchaseReturn.status !== PURCHASE_RETURN_STATUS.DRAFT) {
    return await PurchaseReturnCollection.findByIdAndUpdate(id, {
      $set: {
        note: info.note
      }
    }, {new: true}).exec();
  }

  await validatePurchaseReturnInfo(info);
  if (info.status === PURCHASE_RETURN_STATUS.COMPLETED) {
    await checkBatchQuantity(info.purchaseReturnItems);
  }

  const paymentNoteIds = persistedPurchaseReturn.paymentNoteIds || [];
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(info.payment, info,
    PaymentNoteConstants.PTTHN, true, id)
  if (paymentNote) {
    paymentNoteIds.push(get(paymentNote, '_doc._id'));
  }

  const willBeUpdate = mapInfoToPurchaseReturn(info, true);
  willBeUpdate.paymentNoteIds = paymentNoteIds;

  const paymentSummary = await calculatePaymentSummary(info);
  willBeUpdate.subTotal = paymentSummary.subtotal;
  willBeUpdate.totalSupplierPayment = paymentSummary.totalSupplierPayment;
  willBeUpdate.totalSupplierPaid = paymentSummary.totalSupplierPaid;
  willBeUpdate.supplierDebt = paymentSummary.supplierDebt;

  const updatedPurchaseReturn = await PurchaseReturnCollection.findByIdAndUpdate(id, {
    $set: willBeUpdate
  });
  logger.info(`Updated Purchase return with code[${updatedPurchaseReturn.code}]`)

  const purchaseReturnId = get(updatedPurchaseReturn, '_doc._id');

  // Create inventory transaction if Completed
  if (info.status === PURCHASE_RETURN_STATUS.COMPLETED) {
    await createPurchaseReturnInventoryTransaction(info, purchaseReturnId, updatedPurchaseReturn);
  }

  return await findByQuery({_id: id});
};

/**
 * validate PurchaseReturn info
 * @param purchaseReturnInfo
 */
const validatePurchaseReturnInfo = async (purchaseReturnInfo: any) => {

  // Validate Status
  const status: any = purchaseReturnInfo.status;
  if (status !== PURCHASE_RETURN_STATUS.DRAFT && status !== PURCHASE_RETURN_STATUS.COMPLETED) {
    throw new ValidationFailedError(`Status ${status} is not valid.`);
  }

  // Validate supplier Id
  if (purchaseReturnInfo.supplierId) {
    const isSupplierValid = await SupplierCollection.exists({
      _id: purchaseReturnInfo.supplierId,
      partnerId: purchaseReturnInfo.partnerId,
      deletedAt: null,
      status: SUPPLIER_STATUS.ACTIVE
    });
    if (!isSupplierValid) {
      throw new ValidationFailedError(`Supplier ID ${purchaseReturnInfo.supplierId} is not valid.`);
    }
  }

  // Validate PurchaseReturnItems
  if (isNil(purchaseReturnInfo.purchaseReturnItems) || purchaseReturnInfo.purchaseReturnItems.length === 0) {
    throw new ValidationFailedError('purchaseReturnItems is required.');
  }

  // Validate PurchaseReturnItems item
  for (const item of purchaseReturnInfo.purchaseReturnItems) {
    if (isNil(item.variantId)) {
      throw new ValidationFailedError('purchaseReturnItem.variantId is required.');
    }
    if (isNil(item.buyPrice) || isNil(item.returnPrice) || isNil(item.finalPrice)) {
      throw new ValidationFailedError('purchaseReturnItem.price is required.');
    }
    if (isNil(item.batches) || item.batches.length === 0) {
      throw new ValidationFailedError('purchaseReturnItem.batches is required.');
    }
    const branchId = purchaseReturnInfo.branchId;
    const productVariant = await ProductVariantCollection.findOne({
      _id: item.variantId,
      branchId
    }).lean();
    if (isNil(productVariant)) {
      throw new ValidationFailedError(`purchaseReturnItem.variantId ${item.variantId} is not found.`);
    }
    // Validate batch item 
    for (const batchItem of item.batches) {
      if (isNil(batchItem.batchId) || isNil(batchItem.quantity)) {
        throw new ValidationFailedError('purchaseReturnItem.batches is not valid.');
      }
      const batch = await BatchCollection.findOne({
        _id: batchItem.batchId,
        productId: productVariant.productId,
        variantId: item.variantId
      }).lean().exec();
      if (isNil(batch)) {
        throw new ValidationFailedError(`purchaseReturnItem.batches ${batchItem.batchId} is not valid.`);
      }
    }
  }
}

async function createPurchaseReturnInventoryTransaction(purchaseReturnInfo: any,
                                                        purchaseReturnId: string,
                                                        purchaseReturnDoc: any) {
  if (purchaseReturnInfo.status !== PURCHASE_RETURN_STATUS.COMPLETED) {
    return;
  }
  logger.info(`Creating Purchase return InventoryTransaction. purchaseReturnId=${JSON.stringify(purchaseReturnId)} `)

  const {supplierId, partnerId, branchId} = purchaseReturnInfo;
  const inventoryTransactionIds: string[] = [];
  for (const item of purchaseReturnInfo.purchaseReturnItems) {
    for (const batchItem of item.batches) {
      const inventoryTransactionInfo = {
        supplierId,
        partnerId,
        branchId,
        productId: item.productId,
        variantId: item.variantId,
        batchId: batchItem.batchId,
        quantity: batchItem.quantity,
        referenceDocId: purchaseReturnId
      }
      const createdInventoryTransaction = await inventoryTransactionService.createInventoryTransaction(
        inventoryTransactionInfo, INVENTORY_TRANSACTION_TYPE.PURCHASE_RETURN);
      inventoryTransactionIds.push(get(createdInventoryTransaction, '_doc._id'));
    }
  }
  purchaseReturnDoc.inventoryTransactionIds = inventoryTransactionIds;
  await purchaseReturnDoc.save()
}

/**
 * Return total amount that need to pay supplier.
 * @param info
 * @param id
 */
const calculatePaymentSummary = async (info: any, id: string = undefined) => {
  const subtotal = info.purchaseReturnItems.reduce((a: any, b: { finalPrice: any; }) => a + b.finalPrice, 0);
  const discountValue = info.discountValue || 0;
  const totalSupplierPayment = subtotal - discountValue;
  let totalSupplierPaid = 0;
  if (id) {
    const paymentNotes = await PaymentNoteCollection.find({
      referenceDocId: id,
      referenceDocName: PaymentNoteConstants.PTTHN.referenceDocName
    }).lean().exec();
    if (paymentNotes && paymentNotes.length > 0) {
      for (const paymentNote of paymentNotes) {
        totalSupplierPaid += paymentNote.paymentAmount;
      }
    }
  }
  if (info.payment && info.payment.amount) {
    totalSupplierPaid += info.payment.amount;
  }
  return {
    subtotal,
    totalSupplierPayment,
    totalSupplierPaid,
    supplierDebt: totalSupplierPayment - totalSupplierPaid
  };
}

const fetchPurchaseReturns = async (queryInput: any, options: any) => {
  let query = {
    deletedAt: null
  } as any;
  if (queryInput.keyword && queryInput.keyword.trim().length !== 0) {
    query.code = {
      $regex: '.*' + queryInput.keyword + '.*', $options: 'i'
    }
  }
  if (!isNil(queryInput.status) && queryInput.status.trim().length !== 0) {
    const statuses = queryInput.status.split(',');
    query.status = {
      $in: statuses
    }
  }
  const purchaseReturns = await PurchaseOrderCollection.paginate(query, {
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
      {path: 'paymentNotes'},
      {path: 'inventoryTransactions', match: {status: {$ne: InventoryTransactionConstants.STATUS.CANCELED}}},
      {path: 'createdBy', select: '-password'}
    ],
    lean: true
  });
  const {docs, ...rest} = purchaseReturns
  const resultDocs = [];
  for (const doc of docs) {
    await setPurchaseReturnFullBatches(doc);
    resultDocs.push(doc);
  }
  const summary = await summaryPurchaseReturns(query);
  return {
    docs: resultDocs,
    ...rest,
    summary
  };
}

const summaryPurchaseReturns = async (query: any) => {
  const summaryPurchaseReturns = await PurchaseReturnCollection.aggregate([
    {
      $match: query
    },
    {
      $project: {
        _id: 0,
        totalSupplierPayment: 1,
        discountValue: 1,
        supplierDebt: 1,
        totalSupplierPaid: 1,
      }
    },
    {
      $group: {
        _id: null,
        totalSupplierPayment: {
          $sum: '$totalSupplierPayment'
        },
        discountValue: {
          $sum: '$discountValue'
        },
        supplierDebt: {
          $sum: '$supplierDebt'
        },
        totalSupplierPaid: {
          $sum: '$totalSupplierPaid'
        }
      }
    }
  ]).exec();
  if (summaryPurchaseReturns.length > 0) {
    const summary = summaryPurchaseReturns[0];
    return {
      totalSupplierPayment: summary.totalSupplierPayment,
      discountValue: summary.discountValue,
      supplierDebt: summary.supplierDebt,
      totalSupplierPaid: summary.totalSupplierPaid
    }
  }
  return {
    totalSupplierPayment: 0,
    discountValue: 0,
    supplierDebt: 0,
    totalSupplierPaid: 0
  }
}

const getPurchaseReturn = async (query: any) => {
  return await PurchaseReturnCollection.findOne(query).exec();
};

const findByQuery = async (query: any) => {
  const result = await PurchaseReturnCollection.findOne(query)
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
    .populate('paymentNotes')
    .populate({
      path: 'inventoryTransactions',
      match: {status: {$ne: InventoryTransactionConstants.STATUS.CANCELED}}
    })
    .populate({
      path: 'createdBy',
      select: '-password'
    })
    .lean()
    .exec();
  await setPurchaseReturnFullBatches(result);
  return result;
}

/**
 * 1. Cancel PurchaseReturn and set CANCELED status
 * 2. Cancel and restore quantity InventoryTransaction
 * 3. Cancel PaymentNote if necessary
 * @param purchaseReturnId
 * @param voidPayment
 */
const cancelPurchaseReturn = async (purchaseReturnId: string, voidPayment: boolean) => {
  const canceledPurchaseOrder = await PurchaseOrderCollection.findByIdAndUpdate(
    purchaseReturnId, {
      $set: {
        status: PURCHASE_RETURN_STATUS.CANCELED
      }
    }, {new: true}).lean();
  const inventoryTransactions = canceledPurchaseOrder.inventoryTransactions || [];
  for (const inventoryTransactionId of inventoryTransactions) {
    await inventoryTransactionService.cancelInventoryTransaction(inventoryTransactionId)
  }
  if (voidPayment) {
    const paymentNoteIds = canceledPurchaseOrder.paymentNoteIds || [];
    for (const paymentNoteId of paymentNoteIds) {
      await paymentNoteService.cancelPaymentNote({_id: paymentNoteId})
    }
  }
  return true;
}

const setPurchaseReturnFullBatches = async (doc: any) => {
  if (doc && doc?.purchaseReturnItems) {
    for (const item of doc.purchaseReturnItems) {
      item.fullBatches = await BatchCollection.find({variantId: item.variantId}).lean().exec();
    }
  }
}

const mapInfoToPurchaseReturn = (info: any, isUpdate: boolean) => {
  const baseInfoPurchaseReturn = {
    purchaseReturnItems: info.purchaseReturnItems,
    totalProduct: info.purchaseReturnItems.length,
    discountValue: info.discountValue,
    discountPercent: info.discountPercent,
    discountType: info.discountType,
    partnerId: info.partnerId,
    branchId: info.branchId,
    status: info.status,
    supplierId: info.supplierId,
    note: info.note,
    involvedById: info.involvedById,
    involvedBy: info.involvedBy,
    purchasedAt: info.purchasedAt,
    paymentNoteIds: undefined as any,
    totalQuantity: undefined as any,
    subTotal: undefined as any,
    totalSupplierPayment: undefined as any,
    totalSupplierPaid: undefined as any,
    supplierDebt: undefined as any
  }

  if (!isUpdate) {
    return {
      ...baseInfoPurchaseReturn,
      createBy: info.createdBy
    }
  }
  return baseInfoPurchaseReturn;
}

const checkBatchQuantity = async (items: any) => {
  for (const item of items) {
    for (const batchItem of item.batches) {
      const batch = await BatchCollection.findById(batchItem.batchId).lean();
      if (batchItem.quantity > batch.quantity) {
        throw new ValidationFailedError(`Quantity is not valid for Batch ID ${batchItem.batchId}.`);
      }
    }
  }
}

export default {
  createPurchaseReturn,
  getPurchaseReturn,
  updatePurchaseReturn,
  fetchPurchaseReturns,
  findByQuery,
  cancelPurchaseReturn
};
