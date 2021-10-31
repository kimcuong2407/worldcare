import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import ProductUnitCollection from './productUnit.collection';

const createProductUnit = async (info: any, language = 'vi') => {
  const createProductUnit = await ProductUnitCollection.create(info);
  const data = await ProductUnitCollection.findOne({
    _id: createProductUnit._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductUnit = async (language = 'vi', isRaw = false) => {
  let data = await ProductUnitCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductUnitInfo = async (query: any) => {
  const productUnit = await ProductUnitCollection.findOne(query).exec();
  return productUnit;
};

const updateProductUnit = async (id: string, ProductUnit: any) => {
  const updatedProductUnit = await ProductUnitCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductUnit,
      },
    }
  );
  return ProductUnitCollection.findById(id);
};

const deleteProductUnit = async (id: string) => {
  return ProductUnitCollection.findByIdAndDelete(id);
};

export default {
  createProductUnit,
  getProductUnit,
  getProductUnitInfo,
  updateProductUnit,
  deleteProductUnit,
};
