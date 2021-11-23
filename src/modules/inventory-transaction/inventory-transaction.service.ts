import InventoryTransactionCollection from './inventory-transaction.collection'
import _ from 'lodash';
import loggerHelper from '@utils/logger.util';
import LotCollection from '@modules/batch/batch.collection';
import {INVENTORY_TRANSACTION_TYPE} from '@modules/inventory-transaction/constant';

const logger = loggerHelper.getLogger('inventory-transaction.service');

const deleteInventoryTransaction = async (id: string) => {
  const inventoryTransactionDoc = await InventoryTransactionCollection.findOne({_id: id});
  if (_.isNil(inventoryTransactionDoc)) {
    logger.info(`Inventory transaction ID[${id}] can not be found.`);
    return;
  }
  const inventoryTransaction = _.cloneDeep(_.get(inventoryTransactionDoc, '_doc'))
  await InventoryTransactionCollection.findByIdAndUpdate(id, {
    deletedAt: new Date()
  });
  // Find. if can not find. return
  // Found. update data
  // update batch quantity base on transaction type
  const batchDoc = await LotCollection.findOne({_id: inventoryTransaction.batchId})
  if (!_.isNil(batchDoc)) {
    switch (inventoryTransaction.type) {
      case INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT:
      case INVENTORY_TRANSACTION_TYPE.SELL_PRODUCT:
        await LotCollection.findOneAndUpdate({
          _id: _.get(batchDoc, '_doc._id')
        }, {
          $set: {
            quantity: _.get(batchDoc, '_doc.quantity') + inventoryTransaction.quantity
          }
        })
        break;
      case INVENTORY_TRANSACTION_TYPE.PURCHASE_RECEIPT:
        await LotCollection.findOneAndUpdate({
          _id: _.get(batchDoc, '_doc._id')
        }, {
          $set: {
            quantity: _.get(batchDoc, '_doc.quantity') - inventoryTransaction.quantity
          }
        })
        break;
    }
  }

}

export default {
  deleteInventoryTransaction
}