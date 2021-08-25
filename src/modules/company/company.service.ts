import makeQuery from '@app/core/database/query';
import addressUtil from '@app/utils/address.util';
import appUtil from '@app/utils/app.util';
import loggerHelper from '@utils/logger.util';
import { countBy, each, filter, find, map, toUpper } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import moment from 'moment';
import { Types } from 'mongoose';
import AppointmentCollection from '../appointment/appointment.collection';
import authService from '../auth/auth.service';
import SpecialityCollection from '../configuration/speciality.collection';
import employeeService from '../employee/employee.service';
import StaffCollection from '../staff/staff.collection';
import userService from '../user/user.service';
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
    existedCompany = await CompanyCollection.find({ slug: availableSlug });
    index = index + 1;
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

const formatCompany = (company: any, preferLang = 'vi') => {
  // company = company.toJSON();
  const address = addressUtil.formatAddressV2(get(company, 'address'));
  return {
    ...appUtil.mapLanguage(company, preferLang),
    address,
  }
}

const fetchCompany = async (params: any, language = 'vi') => {

  CompanyCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);

  const {
    specialityId, keyword, options, city, companyId, companyType,
  } = params;
  const query: any = {
    deletedAt: null,
  };

  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  if (companyId) {
    query['_id'] = Types.ObjectId(companyId);
  }
  // console.log(await CompanyCollection.find({speciality: {$in: [specialityId]}}))

  if (specialityId) {
    query['speciality'] = { $in: [Types.ObjectId(specialityId)] };
  }
  if (city) {
    query['address.city'] = city;
  }
  if(companyType) {
    query['companyType'] = companyType;
  }
  const aggregate = CompanyCollection.aggregate([
    {
      $match: query
    }
  ]);

  const result = await CompanyCollection.aggregatePaginate(aggregate, { ...options });

  // const data = await CompanyCollection.find({
  //   _id: { $in: map(result.docs, '_id') }
  // }).populate({ path: 'speciality', select: 'name', ref: 'speciality' })
  const { docs, ...rest } = result;
  return {
    ...rest,
    docs: map(docs, (doc) => formatCompany(doc, language)),
  };
}

const fetchCompanyInfo = async (companyIdOrSlug: string, language = 'vi', isRaw = false) => {
  let company = null;
  let query: any = { $or: [{_id: companyIdOrSlug},{ slug: companyIdOrSlug }] };

  if (isRaw) {
    return CompanyCollection.findOne(query).lean();
  }

  company = await CompanyCollection.findOne(query).populate('speciality', 'name').lean();
  const doctor = await StaffCollection.findOne({ company: get(company, '_id') });

  const formatted = formatCompany(company, language);
  return {
    ...formatted,
    doctor: doctor,
  }
}

const getSimillarCompany = async (companyIdOrSlug: string, language = 'vi') => {
  let company = null;
  let query: any = { slug: { $ne: companyIdOrSlug } };
  if (Types.ObjectId.isValid(companyIdOrSlug)) {
    query = { _id: { $ne: Types.ObjectId(companyIdOrSlug) } };
  }

  company = await CompanyCollection.find(query).populate('speciality', 'name');

  const data = await CompanyCollection.find(query).limit(5).populate({ path: 'speciality', select: 'name', ref: 'speciality' })

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
  return CompanyCollection.findOne({
    companyCode: companyCode
  });
}


const isCompany = async (companyIdOrSlug: string) => {
  if (Types.ObjectId.isValid(companyIdOrSlug)) {
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


const fetchCompanyByType = async (companyType: string, keyword: string, language = 'vi') => {
  const query: any = {
    companyType: toUpper(companyType),
  }
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  const result = await makeQuery(CompanyCollection.find(query).sort({ name: 1 }).limit(20).lean().exec());
  return map(result || [], (doc) => formatCompany(doc, language));
}

const createCompanyUser = async (staff: any, companyId: string) => {
  const {
    firstName,
    lastName,
    address,
    description,
    gender,
    title,
    degree,
    speciality,
    avatar,
    employeeHistory,
    phoneNumber,
    password,
    username,
    employeeGroup,
    certification,
    email,
    groups,
  } = staff;

  const user = {
    username,
    phoneNumber,
    email,
    password,
    companyId,
    groups,
  };
  const createdUser = await userService.createUserAccount(user);
  const userId = get(createdUser, '_id');
  await authService.assignUserToGroup(userId, groups || [], companyId);

  const staffInfo: any = {
    firstName,
    lastName,
    address,
    companyId,
    userId: get(createdUser, '_id'),
    fullName: (firstName && lastName ? `${firstName} ${lastName}` : null),
    description,
    gender,
    phoneNumber,
    email,
    title: title || [],
    degree: degree || [],
    speciality: speciality || [],
    employeeGroup,
    avatar,
    employeeHistory,
    certification,
  };

  return await employeeService.createStaff(staffInfo);
}

const getCompanyUsers = async (companyId: number, options: any) => {
  return employeeService.getEmployeeByCompanyId(companyId, options)
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
  fetchCompanyByType,
  createCompanyUser,
  getCompanyUsers,
};
