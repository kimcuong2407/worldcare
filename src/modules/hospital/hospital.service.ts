import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import HospitalCollection from "./hospital.collection";
import { HospitalModel } from "./hospital.model";

const logger = loggerHelper.getLogger('hospital.service');

const createHospital = async (hospitalInfo: HospitalModel, language = 'vi') => {
  const findFilter = {
    slug: get(hospitalInfo, 'slug', ''),
  };
  const existedHospital = await HospitalCollection.find(findFilter);
  if (!isEmpty(existedHospital)) {
    throw new Error('The hospital slug has been duplicated!');
  }
  const hospital = await HospitalCollection.create(hospitalInfo);
  const { createdAt, updatedAt, ...rest } = get(hospital, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const fetchHospital = async (params: any, language= 'vi') => {
  const {
    keyword, options,
  } = params;
  const query = keyword ? {
    $text: { $search: keyword }
  } : {};
  const data = await HospitalCollection.paginate(query, options);
  return data;
}

const fetchHospitalInfo = async (hospitalId: string, language= 'vi') => {
  const data = await HospitalCollection.findById(hospitalId);
  if (!data) {
    throw new Error('There is no hospitalId!');
  }
  return data;
};

const updateHospitalInfo = async (params: any) => {
  const { hospitalId, hospitalInfo } = params;
  const findFilter = {
    _id: {
      $ne: Types.ObjectId(hospitalId),
    },
    slug: get(hospitalInfo, 'slug', ''),
  };
  const existedHospital = await HospitalCollection.find(findFilter);
  if (!isEmpty(existedHospital)) {
    throw new Error('The hospital slug has been duplicated!');
  }
  const hospital = await HospitalCollection.findByIdAndUpdate(hospitalId, hospitalInfo, { new: true });
  if (!hospital) {
    throw new Error('There is no hospitalId!');
  }
  const { createdAt, updatedAt, ...rest } = get(hospital, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteHospital = async (hospitalId: string) => {
  const data = await HospitalCollection.findByIdAndDelete(hospitalId);
  if (isNull(data)){
    const data = await HospitalCollection.findById(hospitalId);
    if (!data) {
      throw new Error('There is no hospitalId!');
    }
  }
  return true;
};

export default {
  createHospital,
  fetchHospital,
  fetchHospitalInfo,
  updateHospitalInfo,
  deleteHospital,
};
