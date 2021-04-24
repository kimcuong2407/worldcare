import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import { map } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import SpecialityCollection from '../configuration/speciality.collection';
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

const formatHospital = (hospital: any) => {
  const address = addressUtil.formatAddress(get(hospital, 'address'));
  return {
    ...hospital,
    address,
  }
}

const fetchHospital = async (params: any, language= 'vi') => {
  const {
    keyword, options,
  } = params;
  const query = keyword ? {
    $text: { $search: keyword }
  } : {};
  HospitalCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);

  const data = await HospitalCollection.paginate(query, {
    ...options,
    lean: true,
    'populate': { path: 'speciality', select: 'name'},
  });
  
  return {
    ...data,
    docs: map( get(data, 'docs', []), formatHospital)
  }
}

const fetchHospitalInfo = async (hospitalIdOrSlug: string, language= 'vi', isRaw = false) => {
  let hospital = null;
  HospitalCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);
  if( Types.ObjectId.isValid(hospitalIdOrSlug)) {
    hospital = await HospitalCollection.findById(hospitalIdOrSlug).populate('speciality', 'name').exec();
  } else {
    hospital = await HospitalCollection.findOne({slug: hospitalIdOrSlug}).populate('speciality', 'name').exec();
  }

  if (!hospital) {
    throw new Error('There is no hospitalId!');
  }
  if(isRaw) {
    hospital = hospital.toJSON({virtuals: false})
  }
  
  return formatHospital(hospital);
}

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
  if (isNull(data)) {
    const data = await HospitalCollection.findById(hospitalId);
    if (!data) {
      throw new Error('There is no hospitalId!');
    }
  }
  return true;
};

const isHospital = async (hospitalId: string) => {
  const data = await HospitalCollection.exists({
    _id: Types.ObjectId(hospitalId),
  });
  return data;
}

export default {
  createHospital,
  fetchHospital,
  fetchHospitalInfo,
  updateHospitalInfo,
  deleteHospital,
  isHospital,
};
