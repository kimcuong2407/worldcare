import appUtil from '@app/utils/app.util';
import map from 'lodash/map';
import { COUNTRY_STATUS } from './constant';
import CountryCollection from './country.collection';

const createCountry = async (info: any, language = 'vi') => {
  const created = await CountryCollection.create(info);
  const data = await CountryCollection.findOne({
    _id: created._id
  });
  data.setLanguage(language);
  return data;
};

const fetchCountryList = async (query: any, language = 'vi', isRaw = false) => {
  let data = await CountryCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const fetchCountryInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await CountryCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateCountry = async (id: string, info: any) => {
  return await CountryCollection.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  ).lean().exec();
};

const deleteCountry = async (id: string) => {
  return CountryCollection.findOneAndUpdate({_id: id}, {status: COUNTRY_STATUS.DELETED, deleteAt: new Date()}, { new: true }).lean().exec()
};


export default {
  createCountry,
  fetchCountryList,
  fetchCountryInfo,
  updateCountry,
  deleteCountry,
};