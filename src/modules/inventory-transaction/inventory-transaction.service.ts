import InventoryTransactionCollection from './inventory-transaction.collection'
import _ from 'lodash';
import loggerHelper from '@utils/logger.util';
import batchService from '@modules/batch/batch.service';
import {INVENTORY_TRANSACTION_TYPE, InventoryTransactionConstants} from '@modules/inventory-transaction/constant';

const logger = loggerHelper.getLogger('inventory-transaction.service');

/**
 * Cancel and restore quantity
 * @param id
 */
const cancelInventoryTransaction = async (id: string) => {
  const inventoryTransaction = await InventoryTransactionCollection.findByIdAndUpdate(id, {
    $set: {
      status: InventoryTransactionConstants.STATUS.CANCELED
    }
  }).exec();
  logger.info(`InventoryTransaction is canceled. Id=${id}`);
  if (_.isNil(inventoryTransaction)) {
    logger.info(`Inventory transaction ID[${id}] can not be found.`);
    return;
  }

  const inventoryTransactionDoc = _.get(inventoryTransaction, '_doc');
  // Update batch quantity base on transaction type
  switch (inventoryTransactionDoc.type) {
    case INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RETURN:
    case INVENTORY_TRANSACTION_TYPE.DAMAGE_ITEM:
      await batchService.increaseQuantity(inventoryTransactionDoc.batchId, inventoryTransactionDoc.quantity);
      break;
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT:
      await batchService.decreaseQuantity(inventoryTransactionDoc.batchId, inventoryTransactionDoc.quantity);
      break;
  }
  await updateLatestQuantity(inventoryTransactionDoc.variantId, inventoryTransactionDoc.branchId, inventoryTransaction);
}

/**
 * Create inventory transaction and update batch quantity
 * @param info
 * @param type
 */
const createInventoryTransaction = async (info: any, type: INVENTORY_TRANSACTION_TYPE) => {
  if (_.isNil(info) || _.isNil(type)) {
    logger.warn('Can not create Inventory transaction. input=' + JSON.stringify(info));
    return null;
  }
  if (!Object.values(INVENTORY_TRANSACTION_TYPE).includes(type)) {
    logger.info(`Inventory type ${type} is not supported.`);
    return null;
  }
  const inventoryTransaction = {
    type,
    supplierId: info.supplierId,
    customerId: info.customerId,
    partnerId: info.partnerId,
    branchId: info.branchId,
    productId: info.productId,
    batchId: info.batchId,
    variantId: info.variantId,
    quantity: info.quantity,
    referenceDocId: info.referenceDocId,
    status: InventoryTransactionConstants.STATUS.ACTIVE
  }

  const document = await InventoryTransactionCollection.create(inventoryTransaction);
  logger.info('Inventory transaction is created. inventoryTransaction=' + JSON.stringify(inventoryTransaction));
  switch (type) {
    case INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RETURN:
    case INVENTORY_TRANSACTION_TYPE.DAMAGE_ITEM:
      await batchService.decreaseQuantity(info.batchId, info.quantity);
      break;
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT:
      await batchService.increaseQuantity(info.batchId, info.quantity);
      break;
  }
  await updateLatestQuantity(info.variantId, info.branchId, document);

  return document;
}

const updateLatestQuantity = async (variantId: string, branchId: string, inventoryDocument: any) => {
  const batches = await batchService.fetchBatches(variantId, branchId);
  let latestQuantity = 0;
  for (const batch of batches) {
    latestQuantity += batch.quantity;
  }
  inventoryDocument.latestQuantity = latestQuantity;
  await inventoryDocument.save();
}

export default {
  cancelInventoryTransaction,
  createInventoryTransaction
}