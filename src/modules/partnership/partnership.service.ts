import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, map, omitBy, pick } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import PartnershipCollection from '../partnership/partnership.collection';
import addressUtil from '@utils/address.util';
import branchService from '../branch/branch.service';
import appUtil from '@app/utils/app.util';
import employeeService from '../employee/employee.service';
import authService from '../auth/auth.service';
import { ROOT_COMPANY_ID } from '@app/core/constant';

const findPartnership = async (query: any) => {
  return makeQuery(PartnershipCollection.find(query).lean().exec());
}

const createPartnership = async (partnership: any) => {
  const { 
    slug,
    name,
    address,
    description,
    logo,
   } = partnership;
  const partnershipInfo = {
    slug,
    name,
    address,
    description,
    logo,
  };
  return makeQuery(PartnershipCollection.create(partnership));
}


const updatePartnership = async (partnershipId: string, partnership: any) => {
  return makeQuery(PartnershipCollection.findByIdAndUpdate(partnershipId, { $set: partnership }, { new: true }).exec());
}

const findPartnershipById = async (partnershipId: string) => {
  return makeQuery(PartnershipCollection.findById(partnershipId).exec());
}

const getPartnershipInfo = async (partnershipId: string) => {
  let data = await PartnershipCollection.findById(partnershipId).lean();
  return data;
}

const fetchPartnership = async (params: any, options: any) => {
  const {
    keyword
  } = params;
  const query: any = {
  };
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  let data = await PartnershipCollection.paginate(query, {
    ...options,
    sort: {
      name: -1,
    }
  });
  return data;
}

const deletePartnership = async (partnershipId: string) => {
  await PartnershipCollection.findByIdAndDelete(partnershipId);
  return true;
};

export default {
  findPartnership,
  createPartnership,
  findPartnershipById,
  deletePartnership,
  fetchPartnership,
  getPartnershipInfo,
  updatePartnership,
};
