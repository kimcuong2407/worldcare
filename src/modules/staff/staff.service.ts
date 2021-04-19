import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import StaffCollection from "./staff.collection";
import { StaffModel } from "./staff.model";

const logger = loggerHelper.getLogger('staff.service');

const createStaff = async (staffInfo: StaffModel, language = 'vi') => {
  const findFilter = {
    slug: get(staffInfo, 'slug', ''),
  };
  const existedStaff = await StaffCollection.find(findFilter);
  if (!isEmpty(existedStaff)) {
    throw new Error('The staff slug has been duplicated!');
  }
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
  const data = await StaffCollection.paginate(query, options);
  return data;
}

const fetchStaffInfo = async (staffId: string, language= 'vi') => {
  StaffCollection.setDefaultLanguage(language);
  const data = await StaffCollection.findById(staffId);
  if (!data) {
    throw new Error('There is no staffId!');
  }
  return data;
};

const updateStaffInfo = async (params: any) => {
  const { staffId, staffInfo } = params;
  const findFilter = {
    _id: {
      $ne: Types.ObjectId(staffId),
    },
    slug: get(staffInfo, 'slug', ''),
  };
  const existedStaff = await StaffCollection.find(findFilter);
  if (!isEmpty(existedStaff)) {
    throw new Error('The staff slug has been duplicated!');
  }
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
