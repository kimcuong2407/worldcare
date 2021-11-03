import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import ProductTypeCollection from './productType.collection';

const createProductType = async (info: any, language = 'vi') => {
  const createProductType = await ProductTypeCollection.create(info);
  const data = await ProductTypeCollection.findOne({
    _id: createProductType._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductType = async (language = 'vi', isRaw = false) => {
  let data = await ProductTypeCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductTypeInfo = async (query: any) => {
  const ProductType = await ProductTypeCollection.findOne(query).exec();
  return ProductType;
};

const updateProductType = async (id: string, ProductType: any) => {
  const updatedProductType = await ProductTypeCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductType,
      },
    }
  );
  return ProductTypeCollection.findById(id);
};

const deleteProductType = async (id: string) => {
  return ProductTypeCollection.findByIdAndDelete(id);
};

export default {
  createProductType,
  getProductType,
  getProductTypeInfo,
  updateProductType,
  deleteProductType,
};
