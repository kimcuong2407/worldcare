import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { PRODUCT_POSITION_STATUS } from './constant';
import ProductPositionCollection from './productPosition.collection';

const createProductPosition = async (info: any, language = 'vi') => {
  const createProductPosition = await ProductPositionCollection.create(info);
  const data = await ProductPositionCollection.findOne({
    _id: createProductPosition._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductPositionList = async (query: any, language = 'vi', isRaw = false) => {
  let data = await ProductPositionCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductPositionInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductPositionCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const updateProductPosition = async (query: any, ProductPosition: any) => {
  return await ProductPositionCollection.updateOne(
    query,
    {
      $set: {
        ...ProductPosition,
      },
    },
    { new: true }
  ).lean().exec();
};

const deleteProductPosition = async (id: string) => {
  return ProductPositionCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_POSITION_STATUS.DELETED, deletedAt: new Date()}).lean().exec();
};

export default {
  createProductPosition,
  getProductPositionList,
  getProductPositionInfo,
  updateProductPosition,
  deleteProductPosition,
};
