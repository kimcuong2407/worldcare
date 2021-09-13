import makeQuery from '@app/core/database/query';
import addressUtil from '@app/utils/address.util';
import appUtil from '@app/utils/app.util';
import loggerHelper from '@utils/logger.util';
import { countBy, each, filter, find, lowerCase, map, toUpper, trim } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import moment from 'moment';
import { Types } from 'mongoose';
import normalizeText from 'normalize-text';
import slugify from 'slugify';
import AppointmentCollection from '../appointment/appointment.collection';
import authService from '../auth/auth.service';
import branchService from '../branch/branch.service';
import { WORKING_HOURS } from '../branch/constant';
import SpecialityCollection from '../configuration/speciality.collection';
import employeeService from '../employee/employee.service';
import StaffCollection from '../staff/staff.collection';
import userService from '../user/user.service';
import PartnerCollection from './partner.collection';

const logger = loggerHelper.getLogger('partner.service');

const findAvailableSlug = async (slug: string) => {
  let availableSlug = slug;

  let existedPartner = await PartnerCollection.findOne({
    slug,
  });
  let index = 1;
  while (!isEmpty(existedPartner)) {
    availableSlug = `${slug}-${index}`;
    existedPartner = await PartnerCollection.find({ slug: availableSlug });
    index = index + 1;
  }
  return availableSlug;
}

const createPartner = async (partnerInfo: any) => {
  // const slug = await findAvailableSlug(get(partnerInfo, 'slug'));
  const { name, description, email, phoneNumber, address, logo, modules } = partnerInfo;
  const partner = await PartnerCollection.create({
    ...partnerInfo,
    // slug,
  });
  
  const { _id,  ...rest } = get(partner, '_doc', {});
  const branch = await branchService.createBranch({
    name: {
      vi: name,
    },
    description: {
      vi: description,
    },
    slug: slugify(trim(lowerCase(normalizeText(name)))),
    email,
    phoneNumber,
    address,
    branchType: modules,
    logo,
    workingHours: WORKING_HOURS,
    partnerId: _id
  });
  await authService.setupDefaultRoles(get(branch, '_id'), modules);

  return {
    _id,
    ...formatPartner(rest),
  };
};

const formatPartner = (partner: any, preferLang = 'vi') => {
  // partner = partner.toJSON();
  const address = addressUtil.formatAddressV2(get(partner, 'address'));
  return {
    ...appUtil.mapLanguage(partner, preferLang),
    address,
  }
}

const fetchPartner = async (params: any, options: any) => {
  const {
    keyword, partnerId, modules, cityId, sortBy, sortDirection,
  } = params;
  const query: any = {
    deletedAt: null,
  };

  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  if (partnerId) {
    query['_id'] = partnerId;
  }

  if (cityId) {
    query['address.cityId'] = cityId;
  }

  if (modules && modules.length > 0) {
    query['modules'] = {
      $in: modules
    };
  }
  const aggregate = PartnerCollection.aggregate([
    {
      $match: query
    }
  ]);

  const sort: any = {};

  if (sortBy) {
    sort[sortBy] = sortDirection || -1;
  }

  const result = await PartnerCollection.aggregatePaginate(aggregate, { ...options, sort: isEmpty(sort) ? {
    createdAt: -1,
  } : sort });

  // const data = await PartnerCollection.find({
  //   _id: { $in: map(result.docs, '_id') }
  // }).populate({ path: 'speciality', select: 'name', ref: 'speciality' })
  const { docs, ...rest } = result;
  return {
    ...rest,
    docs: map(docs, (doc) => formatPartner(doc)),
  };
}

const fetchPartnerInfo = async (partnerIdOrSlug: string, language = 'vi', isRaw = false) => {
  let partner = null;
  let query: any = { _id: partnerIdOrSlug };
  partner = await PartnerCollection.findOne(query).lean();

  const formatted = formatPartner(partner);
  return {
    ...formatted,
  }
}

const getSimillarPartner = async (partnerIdOrSlug: string, language = 'vi') => {
  let partner = null;
  let query: any = { slug: { $ne: partnerIdOrSlug } };
  if (Types.ObjectId.isValid(partnerIdOrSlug)) {
    query = { _id: { $ne: Types.ObjectId(partnerIdOrSlug) } };
  }

  partner = await PartnerCollection.find(query).populate('speciality', 'name');

  const data = await PartnerCollection.find(query).limit(5).populate({ path: 'speciality', select: 'name', ref: 'speciality' })

  return map(data, formatPartner)
}


const updatePartnerInfo = async (partnerId: Number, partnerInfo: any) => {
  const partner = await PartnerCollection.findByIdAndUpdate(partnerId, partnerInfo, { new: true });
  const { ...rest } = get(partner, '_doc', {});
  return formatPartner(rest);
};

const deletePartner = async (partnerId: string) => {
  await PartnerCollection.findByIdAndUpdate(partnerId, {$set: {deletedAt: new Date()}});
  return true;
};

const findPartnerByCode = async (partnerCode: string) => {
  return PartnerCollection.findOne({
    partnerCode: partnerCode
  });
}


const isPartner = async (partnerIdOrSlug: string) => {
  if (Types.ObjectId.isValid(partnerIdOrSlug)) {
    const data = await PartnerCollection.exists({
      _id: Types.ObjectId(partnerIdOrSlug),
    });
    return data;
  } else {
    const data = await PartnerCollection.exists({
      slug: partnerIdOrSlug
    });
    return data;
  }
}

const fetchPartnerByType = async (partnerType: string, keyword: string, language = 'vi') => {
  const query: any = {
    partnerType: toUpper(partnerType),
  }
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  const result = await makeQuery(PartnerCollection.find(query).sort({ name: 1 }).limit(20).lean().exec());
  return map(result || [], (doc) => formatPartner(doc, language));
}

const createPartnerUser = async (staff: any, partnerId: string) => {
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
    partnerId,
    groups,
  };
  const createdUser = await userService.createUserAccount(user);
  const userId = get(createdUser, '_id');
  await authService.assignUserToGroup(userId, groups || [], partnerId);

  const staffInfo: any = {
    firstName,
    lastName,
    address,
    partnerId,
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

const getPartnerUsers = async (partnerId: number, options: any) => {
  return employeeService.getEmployeeByPartnerId(partnerId, options)
}

const fetchPartnerBranch = async (partnerId: number) => {
  return branchService.findBranchByPartnerId(partnerId)
}

const findPartnerById = async (partnerId: number) => {
  return PartnerCollection.findById(partnerId);
}

export default {
  createPartner,
  fetchPartner,
  fetchPartnerInfo,
  updatePartnerInfo,
  deletePartner,
  isPartner,
  getSimillarPartner,
  findPartnerByCode,
  formatPartner,
  fetchPartnerByType,
  createPartnerUser,
  getPartnerUsers,
  fetchPartnerBranch,
  findPartnerById,
};
