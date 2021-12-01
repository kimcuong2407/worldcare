import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { PRODUCT_UNIT_STATUS } from './constant';
import ProductUnitCollection from './productUnit.collection';

const createProductUnit = async (info: any, language = 'vi') => {
  const createProductUnit = await ProductUnitCollection.create(info);
  const data = await ProductUnitCollection.findOne({
    _id: createProductUnit._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductUnitList = async (query: any, language = 'vi', isRaw = false) => {
  let data = await ProductUnitCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductUnitInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductUnitCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateProductUnit = async (query: any, ProductUnit: any) => {
  return await ProductUnitCollection.updateOne(
    query,
    {
      $set: {
        ...ProductUnit,
      },
    },
    { new: true }
  ).lean().exec();
};

const deleteProductUnit = async (id: string) => {
  return ProductUnitCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_UNIT_STATUS.DELETED, deletedAt: new Date()}).lean().exec();
};

export default {
  createProductUnit,
  getProductUnitList,
  getProductUnitInfo,
  updateProductUnit,
  deleteProductUnit,
};
