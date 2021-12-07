import loggerHelper from '@utils/logger.util';
import BatchCollection from '@modules/batch/batch.collection';

const logger = loggerHelper.getLogger('batch.service');

const fetchBatches = async (variantId, branchId) => {

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

export default {
  fetchBatches,
};
