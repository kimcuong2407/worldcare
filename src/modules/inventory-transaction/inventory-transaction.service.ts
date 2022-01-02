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
  }).lean().exec();
  if (_.isNil(inventoryTransaction)) {
    logger.info(`Inventory transaction ID[${id}] can not be found.`);
    return;
  }

  // Update batch quantity base on transaction type
  switch (inventoryTransaction.type) {
    case INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RETURN:
      await batchService.increaseQuantity(inventoryTransaction.batchId, inventoryTransaction.quantity);
      break;
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT:
      await batchService.decreaseQuantity(inventoryTransaction.batchId, inventoryTransaction.quantity);
      break;
  }
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
    quantity: info.quantiy,
    referenceDocId: info.referenceDocId,
    status: InventoryTransactionConstants.STATUS.ACTIVE
  }

  const document = await InventoryTransactionCollection.create(inventoryTransaction);
  logger.info('Inventory transaction is created. inventoryTransaction=' + JSON.stringify(inventoryTransaction));
  let updatedBatch;
  switch (type) {
    case INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT:
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RETURN:
      updatedBatch = await batchService.decreaseQuantity(info.batchId, info.quantity);
      break;
    case INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT:
      updatedBatch = await batchService.increaseQuantity(info.batchId, info.quantity);
      break;
  }
  if (updatedBatch) {
    document.latestQuantity = _.get(updatedBatch, '_doc.quantity');
    await document.save();
  }
  return document;
}

export default {
  cancelInventoryTransaction,
  createInventoryTransaction
}