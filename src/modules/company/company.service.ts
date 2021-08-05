import addressUtil from '@app/utils/address.util';
import appUtil from '@app/utils/app.util';
import loggerHelper from '@utils/logger.util';
import { countBy, each, filter, find, map } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import moment from 'moment';
import { Types } from 'mongoose';
import AppointmentCollection from '../appointment/appointment.collection';
import SpecialityCollection from '../configuration/speciality.collection';
import StaffCollection from '../staff/staff.collection';
import CompanyCollection from './company.collection';
import { CompanyModel } from './company.model';

const logger = loggerHelper.getLogger('company.service');

const findAvailableSlug = async (slug: string) => {
  let availableSlug = slug;

  let existedCompany = await CompanyCollection.findOne({
    slug,
  });
  let index = 1;
  while (!isEmpty(existedCompany)) {
    availableSlug = `${slug}-${index}`;
    existedCompany = await CompanyCollection.find({slug: availableSlug});
    index = index+1;
  }
  return availableSlug;
}

const createCompany = async (companyInfo: CompanyModel, language = 'vi') => {
  const slug = await findAvailableSlug(get(companyInfo, 'slug'));
  const company = await CompanyCollection.create({
    ...companyInfo,
    slug,
  });
  const { createdAt, updatedAt, ...rest } = get(company, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const formatCompany = (company: any) => {
  company = company.toJSON();
  const address = addressUtil.formatAddress(get(company, 'address'));
  return {
    ...company,
    address,
  }
}

const fetchCompany = async (params: any, language= 'vi') => {

  CompanyCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);

  const {
    specialityId, keyword, options, city, companyId,
  } = params;
  const query: any = {
    deletedAt: null,
  };

  if(keyword) {
    query['$text'] = { $search: keyword }
  }
  if(companyId) {
    query['_id'] = Types.ObjectId(companyId);
  }
  // console.log(await CompanyCollection.find({speciality: {$in: [specialityId]}}))
  
  if(specialityId) {
    query['speciality'] = {$in: [Types.ObjectId(specialityId)]};
  }
  if(city) {
    query['address.city'] = city;
  }
  const aggregate = CompanyCollection.aggregate([
    {
      $match: query
    }
  ]);

  const result = await CompanyCollection.aggregatePaginate(aggregate, { ...options });

  const data = await CompanyCollection.find({
    _id: { $in: map(result.docs, '_id')}
  }).populate({ path: 'speciality', select: 'name', ref: 'speciality'})
  
  return {
    ...result,
    docs: map(data, formatCompany)
  }
}

const fetchCompanyInfo = async (companyIdOrSlug: string, language= 'vi', isRaw = false) => {
  let company = null;
  let query: any = {slug: companyIdOrSlug};
  if( Types.ObjectId.isValid(companyIdOrSlug)) {
    query = { _id: Types.ObjectId(companyIdOrSlug)};
  }

  if(isRaw) {
    return CompanyCollection.findOne(query).lean();
  }

  CompanyCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);
  company = await CompanyCollection.findOne(query).populate('speciality', 'name');
  const doctor = await StaffCollection.findOne({company: get(company, '_id')});

  const formatted = formatCompany(company);
  return {
    ...formatted,
    doctor: doctor,
  }
}

const getSimillarCompany = async (companyIdOrSlug: string, language= 'vi') => {
  let company = null;
  let query: any = {slug: {$ne: companyIdOrSlug}};
  if( Types.ObjectId.isValid(companyIdOrSlug)) {
    query = { _id: { $ne: Types.ObjectId(companyIdOrSlug) }};
  }

  company = await CompanyCollection.find(query).populate('speciality', 'name');

  const data = await CompanyCollection.find(query).limit(5).populate({ path: 'speciality', select: 'name', ref: 'speciality'})
  
  return map(data, formatCompany)
}


const updateCompanyInfo = async (params: any) => {
  const { companyId, companyInfo } = params;
  const findFilter = {
    _id: {
      $ne: Types.ObjectId(companyId),
    },
    slug: get(companyInfo, 'slug', ''),
  };
  const existedCompany = await CompanyCollection.find(findFilter);
  if (!isEmpty(existedCompany)) {
    throw new Error('The company slug has been duplicated!');
  }
  const company = await CompanyCollection.findByIdAndUpdate(companyId, companyInfo, { new: true });
  if (!company) {
    throw new Error('There is no companyId!');
  }
  const { createdAt, updatedAt, ...rest } = get(company, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteCompany = async (companyId: string) => {
  const data = await CompanyCollection.findByIdAndDelete(companyId);
  if (isNull(data)) {
    const data = await CompanyCollection.findById(companyId);
    if (!data) {
      throw new Error('There is no companyId!');
    }
  }
  return true;
};

const findCompanyByCode = async (companyCode: string) => {
  return CompanyCollection.exists({
    companyCode: companyCode
  });
}


const isCompany = async (companyIdOrSlug: string) => {
  if( Types.ObjectId.isValid(companyIdOrSlug)) {
    const data = await CompanyCollection.exists({
      _id: Types.ObjectId(companyIdOrSlug),
    });
    return data;
  } else {
    const data = await CompanyCollection.exists({
      slug: companyIdOrSlug
    });
    return data;
  }
}

export default {
  createCompany,
  fetchCompany,
  fetchCompanyInfo,
  updateCompanyInfo,
  deleteCompany,
  isCompany,
  getSimillarCompany,
  findCompanyByCode,
  formatCompany,
};
