import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import { map } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import HospitalCollection from '../hospital/hospital.collection';
import hospitalService from '../hospital/hospital.service';
import StaffCollection from "./staff.collection";
import { StaffModel } from "./staff.model";

const logger = loggerHelper.getLogger('staff.service');

const createStaff = async (staffInfo: StaffModel, language = 'vi') => {
  const staff = await StaffCollection.create(staffInfo);
  const { createdAt, updatedAt, ...rest } = get(staff, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const formatStaff = (staff: any) => {
  staff = staff.toJSON();
  const { hospital } = staff;
  const { address: hospitalAddress } = hospital || {};

  const address = addressUtil.formatAddress(get(staff, 'address'));
  return {
    ...staff,
    hospital: {
      ...hospital,
      address: addressUtil.formatAddress(hospitalAddress),
    },
    address,
  }
}

const fetchStaff = async (params: any, language= 'vi') => {
  const {
    keyword, options, hospitalId, title, degree, speciality, employeeGroup
  } = params;
  const query: any = {
  };

  if(hospitalId) {
    query.hospital = hospitalId;
  }
  if(degree) {
    query.degree = degree;
  }
  if(title) {
    query.title = title;
  }
  if(title) {
    query.degree = title;
  }
  if(speciality) {
    query.speciality = speciality;
  }
  if(employeeGroup) {
    query.employeeGroup = employeeGroup;
  }
  
  if(keyword) {
    query['$text'] = { $search: keyword }
  } 
  StaffCollection.setDefaultLanguage(language);
  let data = await StaffCollection.paginate(query, {
    ...options,
    'populate': [
      { path: 'hospital', select: ['hospitalName', 'address', 'workingHours'] },
      { path: 'degree.degreeId', select: 'name' },
      { path: 'title', select: 'name' },
      { path: 'speciality', select: 'name' },
      { path: 'employee_group', select: 'name' },
    ],
  });
  const {docs, ...rest} = data
  return {
    docs: map(docs, formatStaff),
    ...rest
  };
}

const getStaffInfo = async (staffIdOrSlug: string, language= 'vi', isRaw = false) => {
  StaffCollection.setDefaultLanguage(language);
  HospitalCollection.setDefaultLanguage(language);
  let query: any = {slug: staffIdOrSlug}

  let staff;
  if( Types.ObjectId.isValid(staffIdOrSlug)) {
    query = {
      _id: Types.ObjectId(staffIdOrSlug)
    };
  } 

  if(isRaw) {
    return StaffCollection.findOne(query);
  }

  staff = await StaffCollection.findOne(query)
  .populate('hospital', ['hospitalName', 'address', 'workingHours'] )
  .populate('degree.degreeId', 'name')
  .populate('title', 'name')
  .populate('speciality', 'name')
  .populate('employeeGroup', 'name').exec();
  return formatStaff(staff);
};

const updateStaffInfo = async (params: any) => {
  const { staffId, staffInfo } = params;
  const staff = await StaffCollection.findByIdAndUpdate(staffId, staffInfo, { new: true });
  if (!staff) {
    throw new Error('There is no staffId!');
  }
  const { createdAt, updatedAt, ...rest } = get(staff, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteStaff = async (staffId: string) => {
  const data = await StaffCollection.findByIdAndDelete(staffId);
  if (isNull(data)){
    const data = await StaffCollection.findById(staffId);
    if (!data) {
      throw new Error('There is no staffId!');
    }
  }
  return true;
};

export default {
  createStaff,
  fetchStaff,
  getStaffInfo,
  updateStaffInfo,
  deleteStaff,
};
