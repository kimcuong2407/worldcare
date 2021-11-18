import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { PRODUCT_ROUTE_ADMINISTRATION_STATUS } from './constant';
import ProductRouteAdministrationCollection from './productRouteAdministration.collection';

const createProductRouteAdministration = async (info: any, language = 'vi') => {
  const createProductPosition = await ProductRouteAdministrationCollection.create(
    info
  );
  const data = await ProductRouteAdministrationCollection.findOne({
    _id: createProductPosition._id,
  });
  data.setLanguage(language);
  return data;
};

const getProductRouteAdministrationList = async (
  language = 'vi',
  isRaw = false
) => {
  let data = await ProductRouteAdministrationCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getProductRouteAdministrationInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductRouteAdministrationCollection.findOne(
    query
  ).exec();
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const updateProductRouteAdministration = async (
  id: string,
  ProductPosition: any
) => {
  return await ProductRouteAdministrationCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductPosition,
      },
    },
    { new: true }
  );
};

const deleteProductRouteAdministration = async (id: string) => {
  return ProductRouteAdministrationCollection.findOneAndUpdate({_id: id}, {status: PRODUCT_ROUTE_ADMINISTRATION_STATUS.INACTIVE});
};

export default {
  createProductRouteAdministration,
  getProductRouteAdministrationList,
  getProductRouteAdministrationInfo,
  updateProductRouteAdministration,
  deleteProductRouteAdministration,
};
