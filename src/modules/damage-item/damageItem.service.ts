import loggerHelper from '@utils/logger.util';
import {get, isNil} from 'lodash';
import DamageItemCollection from './damageItem.collection';
import {INVENTORY_TRANSACTION_TYPE, InventoryTransactionConstants} from '@modules/inventory-transaction/constant';
import BatchCollection from '@modules/batch/batch.collection';
import inventoryTransactionService from '@modules/inventory-transaction/inventory-transaction.service';
import {ValidationFailedError} from '@core/types/ErrorTypes';
import documentCodeUtils from '@utils/documentCode.util';
import ProductVariantCollection from '@modules/product/productVariant.collection';
import {DamageItemConstants} from '@modules/damage-item/constant';

const logger = loggerHelper.getLogger('damageItem.service');

/**
 * Create Damage item.
 * 1. Create Damage item
 * 2. Create inventory transactions
 * 3. Update Damage item additional info
 *
 * @param info
 */
const createDamageItem = async (info: any) => {
  logger.info('Start create damage item. info=' + JSON.stringify(info))

  await validateDamageItemInfo(info);
  if (info.status === DamageItemConstants.Status.COMPLETED) {
    await checkBatchQuantity(info.detailItems);
  }

  const damageItem = await mapInfoToDamageItem(info, false);

  const createdDamageItem = await DamageItemCollection.create(damageItem);
  createdDamageItem.code = documentCodeUtils.initDocumentCode(
    DamageItemConstants.DOCUMENT_PREFIX_CODE, createdDamageItem.codeSequence
  )
  await createdDamageItem.save();
  logger.info(`Created DamageItem with code[${createdDamageItem.code}]`)

  const damageItemId = get(createdDamageItem, '_doc._id');

  // Create inventory transaction if Completed
  if (info.status === DamageItemConstants.Status.COMPLETED) {
    await createDamageItemInventoryTransaction(info, damageItemId, createdDamageItem);
  }
  return {
    ...get(createdDamageItem, '_doc'),
  };
};

/**
 * Update Damage Item
 * If status is not DRAFT, only update note, processedAt.
 * @param id
 * @param info
 */
const updateDamageItem = async (id: string, info: any) => {
  const persistedDamageItem = await DamageItemCollection.findOne({
    _id: id,
    branchId: info.branchId
  }).lean();

  // If status is not DRAFT, only update note.
  if (persistedDamageItem.status !== DamageItemConstants.Status.DRAFT) {
    logger.info(`Damage Item ID[${id}] has status ${persistedDamageItem.status}. only update note, processedAt`)
    return await DamageItemCollection.findByIdAndUpdate(id, {
      $set: {
        note: info.note,
        processedAt: info.processedAt
      }
    }, {new: true}).exec();
  }

  await validateDamageItemInfo(info);
  if (info.status === DamageItemConstants.Status.COMPLETED) {
    await checkBatchQuantity(info.detailItems);
  }

  const willBeUpdate = await mapInfoToDamageItem(info, true);

  const updatedDamageItem = await DamageItemCollection.findByIdAndUpdate(id, {
    $set: willBeUpdate
  });
  logger.info(`Updated DamageItem with code[${updatedDamageItem.code}]`)

  const damageItemId = get(updatedDamageItem, '_doc._id');

  // Create inventory transaction if Completed
  if (info.status === DamageItemConstants.Status.COMPLETED) {
    await createDamageItemInventoryTransaction(info, damageItemId, updatedDamageItem);
  }

  return updatedDamageItem;
};

/**
 * validate DamageItem info
 * @param damageItemInfo
 */
const validateDamageItemInfo = async (damageItemInfo: any) => {

  // Validate Status
  const status: any = damageItemInfo.status;
  if (status !== DamageItemConstants.Status.DRAFT
    && status !== DamageItemConstants.Status.COMPLETED) {
    throw new ValidationFailedError(`Status ${status} is not valid.`);
  }

  // Validate DamageItemDetailItems
  if (isNil(damageItemInfo.detailItems) || damageItemInfo.detailItems.length === 0) {
    throw new ValidationFailedError('detailItems is required.');
  }

  // Validate DamageItemDetailItems
  for (const item of damageItemInfo.detailItems) {
    if (isNil(item.variantId)) {
      throw new ValidationFailedError('detailItems.variantId is required.');
    }
    if (isNil(item.quantity)) {
      throw new ValidationFailedError('detailItems.quantity is required.');
    }
    if (isNil(item.batchId)) {
      throw new ValidationFailedError('detailItems.batchId is required.');
    }
    const branchId = damageItemInfo.branchId;
    const productVariant = await ProductVariantCollection.findOne({
      _id: item.variantId,
      branchId
    }).lean();
    if (isNil(productVariant)) {
      throw new ValidationFailedError(`detailItems.variantId ${item.variantId} is not found.`);
    }
    // Validate batch item 
    const batch = await BatchCollection.findOne({
      _id: item.batchId,
      productId: productVariant.productId,
      variantId: item.variantId
    }).lean().exec();
    if (isNil(batch)) {
      throw new ValidationFailedError(`batch ${item.batchId} is not valid.`);
    }
    item.productId = productVariant.productId;
  }
}

async function createDamageItemInventoryTransaction(damageItemInfo: any,
                                                        damageItemId: string,
                                                        damageItemDoc: any) {
  if (damageItemInfo.status !== DamageItemConstants.Status.COMPLETED) {
    return;
  }
  logger.info(`Creating DamageItem's InventoryTransaction. damageItemId=${JSON.stringify(damageItemId)} `)

  const {partnerId, branchId} = damageItemInfo;
  const inventoryTransactionIds: string[] = [];
  for (const item of damageItemInfo.detailItems) {
    const inventoryTransactionInfo = {
      partnerId,
      branchId,
      productId: item.productId,
      variantId: item.variantId,
      batchId: item.batchId,
      quantity: item.quantity,
      referenceDocId: damageItemId
    }
    const createdInventoryTransaction = await inventoryTransactionService.createInventoryTransaction(
      inventoryTransactionInfo, INVENTORY_TRANSACTION_TYPE.DAMAGE_ITEM);
    inventoryTransactionIds.push(get(createdInventoryTransaction, '_doc._id'));
  }
  damageItemDoc.inventoryTransactionIds = inventoryTransactionIds;
  await damageItemDoc.save()
}

const fetchDamageItems = async (queryInput: any, options: any) => {
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
  const damageItems = await DamageItemCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1,
    },
    populate: [
      {path: 'detailItems.product'},
      {
        path: 'detailItems.productVariant',
        strictPopulate: false,
        populate: 'unit'
      },
      {path: 'detailItems.batch'},
      {path: 'branch'},
      {path: 'partner'},
      {path: 'inventoryTransactions', match: {status: {$ne: InventoryTransactionConstants.STATUS.CANCELED}}},
      {path: 'createdBy', select: '-password'},
      {path: 'updatedBy', select: '-password'}
    ],
    lean: true
  });
  const {docs, ...rest} = damageItems
  const resultDocs = [];
  for (const doc of docs) {
    await setDamageItemFullBatches(doc);
    resultDocs.push(doc);
  }
  return {
    docs: resultDocs,
    ...rest
  };
}

const getDamageItem = async (query: any) => {
  return await DamageItemCollection.findOne(query).exec();
};

const findByQuery = async (query: any) => {
  const result = await DamageItemCollection.findOne(query)
    .populate('detailItems.product')
    .populate({
      path: 'detailItems.productVariant',
      strictPopulate: false,
      populate: 'unit'
    })
    .populate('detailItems.batch')
    .populate('branch')
    .populate('partner')
    .populate({
      path: 'inventoryTransactions',
      match: {status: {$ne: InventoryTransactionConstants.STATUS.CANCELED}}
    })
    .populate({path: 'createdBy',select: '-password'})
    .populate({path: 'updatedBy',select: '-password'})
    .lean()
    .exec();
  await setDamageItemFullBatches(result);
  return result;
}

/**
 * 1. Cancel DamageItem and set CANCELED status
 * 2. Cancel and restore quantity InventoryTransaction
 * @param damageItemId
 */
const cancelDamageItem = async (damageItemId: string) => {
  const canceledDamageItem = await DamageItemCollection.findByIdAndUpdate(
    damageItemId, {
      $set: {
        status: DamageItemConstants.Status.CANCELED
      }
    }, {new: true}).lean();
  const inventoryTransactionIds = canceledDamageItem.inventoryTransactionIds || [];
  for (const inventoryTransactionId of inventoryTransactionIds) {
    await inventoryTransactionService.cancelInventoryTransaction(inventoryTransactionId)
  }
  return true;
}

const setDamageItemFullBatches = async (doc: any) => {
  if (doc && doc?.detailItems) {
    for (const item of doc.detailItems) {
      item.fullBatches = await BatchCollection.find({variantId: item.variantId}).lean().exec();
    }
  }
}

const mapInfoToDamageItem = async (info: any, isUpdate: boolean) => {
  const baseInfo = {
    detailItems: info.detailItems,
    partnerId: info.partnerId,
    branchId: info.branchId,
    status: info.status,
    note: info.note,
    processedAt: info.processedAt,
    involvedById: info.involvedById,
    involvedBy: info.involvedBy,

    totalCost: undefined as any,
  }

  let totalCost = 0;
  for (const item of info.detailItems) {
    const productVariant = await ProductVariantCollection.findOne({_id: item.variantId});
    item.cost = productVariant.cost;
    item.totalCost = item.quantity * item.cost;

    totalCost += item.totalCost;
  }
  baseInfo.totalCost = totalCost;

  if (isUpdate) {
    return {
      ...baseInfo,
      updatedBy: info.currentUserId
    }
  } else {
    return {
      ...baseInfo,
      createdBy: info.currentUserId
    }
  }
}

const checkBatchQuantity = async (items: any) => {
  for (const item of items) {
    const batch = await BatchCollection.findById(item.batchId).lean();
    if (item.quantity > batch.quantity) {
      throw new ValidationFailedError(`Quantity is not valid for Batch ID ${item.batchId}.`);
    }
  }
}

export default {
  createDamageItem,
  getDamageItem,
  updateDamageItem,
  fetchDamageItems,
  findByQuery,
  cancelDamageItem
};
