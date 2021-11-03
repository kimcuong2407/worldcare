import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import ProductPositionCollection from './productPosition.collection';

const createProductPosition = async (info: any, language = 'vi') => {
  const createProductPosition = await ProductPositionCollection.create(info);
  const data = await ProductPositionCollection.findOne({
    _id: createProductPosition._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductPosition = async (language = 'vi', isRaw = false) => {
  let data = await ProductPositionCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductPositionInfo = async (query: any) => {
  const productPosition = await ProductPositionCollection.findOne(query).exec();
  return productPosition;
};

const updateProductPosition = async (id: string, ProductPosition: any) => {
  const updatedProductPosition = await ProductPositionCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductPosition,
      },
    }
  );
  return ProductPositionCollection.findById(id);
};

const deleteProductPosition = async (id: string) => {
  return ProductPositionCollection.findByIdAndDelete(id);
};

export default {
  createProductPosition,
  getProductPosition,
  getProductPositionInfo,
  updateProductPosition,
  deleteProductPosition,
};
