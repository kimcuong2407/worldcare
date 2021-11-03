import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import ManufacturerCollection from './manufacturer.collection';

const createManufacturer = async (info: any, language = 'vi') => {
  const createManufacturer = await ManufacturerCollection.create(info);
  const data = await ManufacturerCollection.findOne({
    _id: createManufacturer._id,
  });
  data.setLanguage(language);
  return data;
};

const getManufacturer = async (language = 'vi', isRaw = false) => {
  let data = await ManufacturerCollection.find({})
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const getManufacturerInfo = async (query: any) => {
  const manufacturer = await ManufacturerCollection.findOne(query).exec();
  return manufacturer;
};

const updateManufacturer = async (id: string, manufacturer: any) => {
  const updatedManufacturer = await ManufacturerCollection.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ...manufacturer,
      },
    }
  );
  return ManufacturerCollection.findById(id);
};

const deleteManufacturer = async (id: string) => {
  return ManufacturerCollection.findByIdAndDelete(id);
};

export default {
  createManufacturer,
  getManufacturer,
  getManufacturerInfo,
  updateManufacturer,
  deleteManufacturer,
};
