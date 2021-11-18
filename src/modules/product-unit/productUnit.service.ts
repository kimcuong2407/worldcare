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

const getProductUnitList = async (language = 'vi', isRaw = false) => {
  let data = await ProductUnitCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductUnitInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductUnitCollection.findOne(query).exec();
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const updateProductUnit = async (id: string, ProductUnit: any) => {
  return await ProductUnitCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductUnit,
      },
    },
    { new: true }
  );
};

const deleteProductUnit = async (id: string) => {
  return ProductUnitCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_UNIT_STATUS.INACTIVE});
};

export default {
  createProductUnit,
  getProductUnitList,
  getProductUnitInfo,
  updateProductUnit,
  deleteProductUnit,
};
