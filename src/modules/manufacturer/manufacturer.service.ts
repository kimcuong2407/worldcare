import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { MANUFACTURER_STATUS } from './constant';
import ManufacturerCollection from './manufacturer.collection';

const createManufacturer = async (info: any, language = 'vi') => {
  const createManufacturer = await ManufacturerCollection.create(info);
  const data = await ManufacturerCollection.findOne({
    _id: createManufacturer._id,
  });
  data.setLanguage(language);
  return data;
};

const getManufacturerList = async (query: any, language = 'vi', isRaw = false) => {
  let data = await ManufacturerCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getManufacturerInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ManufacturerCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateManufacturer = async (id: string, manufacturer: any) => {
  return ManufacturerCollection.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        ...manufacturer,
      },
    }, { new: true }
  ).lean().exec();
};

const deleteManufacturer = async (id: string) => {
  return ManufacturerCollection.findOneAndUpdate({_id: id}, {status: MANUFACTURER_STATUS.DELETED, deletedAt: new Date()}, { new: true }).lean().exec();
};

export default {
  createManufacturer,
  getManufacturerList,
  getManufacturerInfo,
  updateManufacturer,
  deleteManufacturer,
};
