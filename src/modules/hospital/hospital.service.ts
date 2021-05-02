import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import { map } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import SpecialityCollection from '../configuration/speciality.collection';
import StaffCollection from '../staff/staff.collection';
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
  hospital = hospital.toJSON();
  const address = addressUtil.formatAddress(get(hospital, 'address'));
  return {
    ...hospital,
    address,
  }
}

const fetchHospital = async (params: any, language= 'vi') => {

  HospitalCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);

  const {
    specialityId, keyword, options, city, hospitalId,
  } = params;
  const query: any = {
    deletedAt: null,
  };

  if(keyword) {
    query['$text'] = { $search: keyword }
  }
  if(hospitalId) {
    query['_id'] = Types.ObjectId(hospitalId);
  }
  // console.log(await HospitalCollection.find({speciality: {$in: [specialityId]}}))
  
  if(specialityId) {
    query['speciality'] = {$in: [Types.ObjectId(specialityId)]};
  }
  if(city) {
    query['address.city'] = city;
  }
  const aggregate = HospitalCollection.aggregate([
    {
      $match: query
    }
  ]);

  const result = await HospitalCollection.aggregatePaginate(aggregate, { ...options });

  const data = await HospitalCollection.find({
    _id: { $in: map(result.docs, '_id')}
  }).populate({ path: 'speciality', select: 'name', ref: 'speciality'})
  
  return {
    ...result,
    docs: map(data, formatHospital)
  }
}

const fetchHospitalInfo = async (hospitalIdOrSlug: string, language= 'vi', isRaw = false) => {
  let hospital = null;
  let query: any = {slug: hospitalIdOrSlug};
  if( Types.ObjectId.isValid(hospitalIdOrSlug)) {
    query = { _id: Types.ObjectId(hospitalIdOrSlug)};
  }

  if(isRaw) {
    return HospitalCollection.findOne(query).lean();
  }

  HospitalCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);
  hospital = await HospitalCollection.findOne(query).populate('speciality', 'name');
  const doctor = await StaffCollection.findOne({hospital: get(hospital, '_id')});

  const formatted = formatHospital(hospital);
  return {
    ...formatted,
    doctor: doctor,
  }
}

const getSimillarHospital = async (hospitalIdOrSlug: string, language= 'vi') => {
  let hospital = null;
  let query: any = {slug: {$ne: hospitalIdOrSlug}};
  if( Types.ObjectId.isValid(hospitalIdOrSlug)) {
    query = { _id: { $ne: Types.ObjectId(hospitalIdOrSlug) }};
  }

  hospital = await HospitalCollection.find(query).populate('speciality', 'name');

  const data = await HospitalCollection.find(query).limit(5).populate({ path: 'speciality', select: 'name', ref: 'speciality'})
  
  return map(data, formatHospital)
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

const isHospital = async (hospitalIdOrSlug: string) => {
  if( Types.ObjectId.isValid(hospitalIdOrSlug)) {
    const data = await HospitalCollection.exists({
      _id: Types.ObjectId(hospitalIdOrSlug),
    });
    return data;
  } else {
    const data = await HospitalCollection.exists({
      slug: hospitalIdOrSlug
    });
    return data;
  }
}

export default {
  createHospital,
  fetchHospital,
  fetchHospitalInfo,
  updateHospitalInfo,
  deleteHospital,
  isHospital,
  getSimillarHospital,
};
