import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { PRODUCT_TYPE_STATUS } from './constant';
import ProductTypeCollection from './productType.collection';

const createProductType = async (info: any, language = 'vi') => {
  const createProductType = await ProductTypeCollection.create(info);
  const data = await ProductTypeCollection.findOne({
    _id: createProductType._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductTypeList = async (query: any, language = 'vi', isRaw = false) => {
  let data = await ProductTypeCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductTypeInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductTypeCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateProductType = async (query: any, ProductType: any) => {
  return await ProductTypeCollection.updateOne(
    query,
    {
      $set: {
        ...ProductType,
      },
    },
    {
      new: true,
    }
  ).lean().exec();
};

const deleteProductType = async (id: string) => {
  return ProductTypeCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_TYPE_STATUS.DELETED, deletedAt: new Date()}).lean().exec();
};

export default {
  createProductType,
  getProductTypeList,
  getProductTypeInfo,
  updateProductType,
  deleteProductType,
};
