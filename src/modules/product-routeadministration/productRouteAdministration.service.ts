import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
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

const getProductRouteAdministration = async (
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

const getProductRouteAdministrationInfo = async (query: any) => {
  const productPosition = await ProductRouteAdministrationCollection.findOne(
    query
  ).exec();
  return productPosition;
};

const updateProductRouteAdministration = async (
  id: string,
  ProductPosition: any
) => {
  const updatedProductPosition = await ProductRouteAdministrationCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...ProductPosition,
      },
    }
  );
  return ProductRouteAdministrationCollection.findById(id);
};

const deleteProductRouteAdministration = async (id: string) => {
  return ProductRouteAdministrationCollection.findByIdAndDelete(id);
};

export default {
  createProductRouteAdministration,
  getProductRouteAdministration,
  getProductRouteAdministrationInfo,
  updateProductRouteAdministration,
  deleteProductRouteAdministration,
};
