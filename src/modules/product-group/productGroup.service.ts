import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import ProductGroupCollection from './productGroup.collection';

const createProductGroup = async (info: any, language = 'vi') => {
  const createProductGroup = await ProductGroupCollection.create(info);
  const data = await ProductGroupCollection.findOne({
    _id: createProductGroup._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductGroup = async (language = 'vi', isRaw = false) => {
  let data = await ProductGroupCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductGroupInfo = async (query: any) => {
  const productGroup = await ProductGroupCollection.findOne(query).exec();
  return productGroup;
}

const updateProductGroup = async (
  id: string,
  info: any
) => {
  const updatedProductGroup = await ProductGroupCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...info,
      },
    }
  );
  return ProductGroupCollection.findById(id);
};

const deleteProductGroup = async (id: string,) => {
  return ProductGroupCollection.findByIdAndDelete(id);
}

export default {
  createProductGroup,
  getProductGroup,
  getProductGroupInfo,
  updateProductGroup,
  deleteProductGroup,
};
