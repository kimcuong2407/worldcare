import loggerHelper from '@utils/logger.util';
import BatchCollection from '@modules/batch/batch.collection';

const logger = loggerHelper.getLogger('batch.service');

const fetchBatches = async (variantId: string, branchId: number) => {

  const query: any = {
    deletedAt: null,
    variantId,
    branchId
  }
  return await BatchCollection.find(query)
    .sort({expirationDate: 1})
    .lean()
    .exec();
}

const decreaseQuantity = async (batchId: string, quantity: number) => {
  return await updateQuantity(batchId, quantity, false);
}

const increaseQuantity = async (batchId: string, quantity: number) => {
  await updateQuantity(batchId, quantity, true);
}

const updateQuantity = async (batchId: string, quantity: number, isIncrease: boolean) => {
  const batchDoc = await BatchCollection.findOne({_id: batchId}).lean().exec();
  if (batchDoc) {
    let newQuantity;
    if (isIncrease) {
      newQuantity = batchDoc.quantity + quantity;
    } else {
      newQuantity = batchDoc.quantity - quantity;
    }
    const updated = await BatchCollection.findOneAndUpdate({_id: batchId}, {
      $set: {
        quantity: newQuantity < 0 ? 0 : newQuantity
      }
    }, {new: true}).exec();
    logger.info(`Updated batch quantity. ID=${batchId}. oldQuantity=${batchDoc.quantity}. newQuantity=${newQuantity}`)
    return updated;
  } else {
    logger.info('Batch can not be found to update quantity. ID=' + batchId);
    return null;
  }
}

const setItemsFullBatches = async (items: any[]) => {
  if (!items) {
    return;
  }
  for (const item of items) {
    item.fullBatches = await BatchCollection.find({variantId: item.variantId}).lean().exec();
  }
}

export default {
  fetchBatches,
  decreaseQuantity,
  increaseQuantity,
  updateQuantity,
  setItemsFullBatches
};
