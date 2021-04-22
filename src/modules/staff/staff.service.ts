import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
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

const fetchStaff = async (params: any, language= 'vi') => {
  const {
    keyword, options,
  } = params;
  const query = keyword ? {
    $text: { $search: keyword }
  } : {};
  StaffCollection.setDefaultLanguage(language);
  const data = await StaffCollection.paginate(query, {
    ...options,
    'populate': [
      { path: 'hospital', select: 'hospitalName' },
      { path: 'degree', select: 'name' },
      { path: 'title', select: 'name' },
      { path: 'speciality', select: 'name' },
      { path: 'employee_type', select: 'name' },
    ],
  });
  return data;
}

const fetchStaffInfo = async (staffId: string, language= 'vi', isRaw = false) => {
  StaffCollection.setDefaultLanguage(language);
  let data = await StaffCollection.findById(staffId).populate('hospital', 'hospitalName')
    .populate('degree', 'name')
    .populate('title', 'name')
    .populate('speciality', 'name')
    .populate('employee_type', 'name');
  if (!data) {
    throw new Error('There is no staffId!');
  }
  if(isRaw) {
    data = data.toJSON({virtuals: false})
  }
  return data;
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
  fetchStaffInfo,
  updateStaffInfo,
  deleteStaff,
};
