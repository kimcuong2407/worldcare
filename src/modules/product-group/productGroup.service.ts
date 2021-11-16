import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { PRODUCT_GROUP_STATUS } from './constant';
import ProductGroupCollection from './productGroup.collection';

const createProductGroup = async (info: any, language = 'vi') => {
  const createProductGroup = await ProductGroupCollection.create(info);
  const data = await ProductGroupCollection.findOne({
    _id: createProductGroup._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductGroupList = async (language = 'vi', isRaw = false) => {
  let data = await ProductGroupCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductGroupInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductGroupCollection.findOne(query).exec();
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
}

const updateProductGroup = async (
  id: string,
  info: any
) => {
  return await ProductGroupCollection.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

const deleteProductGroup = async (id: string,) => {
  return ProductGroupCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_GROUP_STATUS.INACTIVE});
}

export default {
  createProductGroup,
  getProductGroupList,
  getProductGroupInfo,
  updateProductGroup,
  deleteProductGroup,
};
