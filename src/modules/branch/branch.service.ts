import casbin from '@app/core/casbin';
import makeQuery from '@app/core/database/query';
import addressUtil from '@app/utils/address.util';
import appUtil from '@app/utils/app.util';
import loggerHelper from '@utils/logger.util';
import { concat, countBy, each, filter, find, forEach, map, toUpper } from 'lodash';
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
import BranchCollection from './branch.collection';
import { BranchModel } from './branch.model';

const logger = loggerHelper.getLogger('branch.service');

const findAvailableSlug = async (slug: string) => {
  let availableSlug = slug;

  let existedBranch = await BranchCollection.findOne({
    slug,
  });
  let index = 1;
  while (!isEmpty(existedBranch)) {
    availableSlug = `${slug}-${index}`;
    existedBranch = await BranchCollection.find({ slug: availableSlug });
    index = index + 1;
  }
  return availableSlug;
}

const createBranch = async (branchInfo: any) => {
  const { parentId } = branchInfo;
  const slug = await findAvailableSlug(get(branchInfo, 'slug'));
  const branch = await BranchCollection.create({
    ...branchInfo,
    slug,
  });
  const { createdAt, updatedAt, _id, ...rest } = get(branch, '_doc', {});

  if (parentId) {
    await authService.assignParentBranch(_id, parentId);
  };

  return {
    ...rest,
    _id,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const formatBranch = (branch: any, preferLang = 'vi') => {
  // branch = branch.toJSON();
  const address = addressUtil.formatAddressV2(get(branch, 'address'));
  return {
    ...appUtil.mapLanguage(branch, preferLang),
    address,
  }
}

const fetchBranch = async (params: any, language = 'vi') => {

  BranchCollection.setDefaultLanguage(language);
  SpecialityCollection.setDefaultLanguage(language);

  const {
    specialityId, keyword, city, branchId, branchType, hospitalId,
  } = params;
  const query: any = {
    deletedAt: null,
  };

  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  if (branchId || hospitalId) {
    query['_id'] = Number(branchId) || Number(hospitalId) ;
  }
  // console.log(await BranchCollection.find({speciality: {$in: [specialityId]}}))

  if (specialityId) {
    query['speciality'] = { $in: [Types.ObjectId(specialityId)] };
  }
  if (city) {
    query['address.cityId'] = city;
  }
  if (branchType) {
    query['branchType'] = toUpper(branchType);
  }
  const aggregate = BranchCollection.aggregate([
    {
      $match: query
    }
  ]);

  const result = await BranchCollection.aggregatePaginate(aggregate, { ...options });

  // const data = await BranchCollection.find({
  //   _id: { $in: map(result.docs, '_id') }
  // }).populate({ path: 'speciality', select: 'name', ref: 'speciality' })
  const { docs, ...rest } = result;
  return {
    ...rest,
    docs: map(docs, (doc) => formatBranch(doc, language)),
  };
}

const fetchBranchInfo = async (branchIdOrSlug: number, language = 'vi', isRaw = false) => {
  let branch = null;
  let query: any = { slug: branchIdOrSlug };
  if (Number(branchIdOrSlug)) {
    query = { _id: branchIdOrSlug };
  }

  query = { ...query, deletedAt: null };

  if (isRaw) {
    const foundBranch = await BranchCollection.findOne(query).lean().exec();
    return {
      ...foundBranch,
      address: addressUtil.formatAddressV2(get(foundBranch, 'address')),
    }
  }

  branch = await BranchCollection.findOne(query).populate('speciality', 'name').lean();
  const doctor = await StaffCollection.findOne({ branch: get(branch, '_id') });

  const formatted = formatBranch(branch, language);
  return {
    ...formatted,
    doctor: doctor,
  }
}

const getSimillarBranch = async (branchIdOrSlug: string, language = 'vi') => {
  let branch = null;
  let query: any = { slug: { $ne: branchIdOrSlug } };
  if ( typeof branchIdOrSlug === 'number') {
    query = { _id: { $ne: branchIdOrSlug } };
  }

  // branch = await BranchCollection.find(query).populate('speciality', 'name');

  const data = await BranchCollection.find(query).limit(5).populate({ path: 'speciality', select: 'name', ref: 'speciality' })

  return map(data, (d) => {
    return formatBranch(d.toJSON());
  })
}


const updateBranchInfo = async (branchId: number, branchInfo: any) => {
  const currentBranch = await findBranchById(branchId);

  const { parentId } = branchInfo;

  const branch = await BranchCollection.findByIdAndUpdate(branchId, branchInfo, { new: true });

  if (parentId !== get(currentBranch, 'parentId')) {
    await authService.updateParentBranch(branchId, get(currentBranch, 'parentId'), parentId);
  }

  return get(branch, '_doc', {})
};

const deleteBranch = async (branchId: string) => {

  await BranchCollection.updateOne({ _id: Number(branchId)}, {
    $set: {
      deletedAt: new Date,
      slug: new Date().getTime(),
    }
  });
  return true;
};

const findBranchByCode = async (branchCode: string) => {
  return BranchCollection.findOne({
    branchCode: branchCode
  });
}


const isBranch = async (branchIdOrSlug: string) => {
  if (Types.ObjectId.isValid(branchIdOrSlug)) {
    const data = await BranchCollection.exists({
      _id: Types.ObjectId(branchIdOrSlug),
    });
    return data;
  } else {
    const data = await BranchCollection.exists({
      slug: branchIdOrSlug
    });
    return data;
  }
}


const fetchBranchByType = async (branchType: string, keyword: string, language = 'vi') => {
  let aggs: any[] = [];
  const query: any = {
    deletedAt: null,
  }
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  aggs.push({
    $match: query
  });

  aggs = aggs.concat([
    {
      '$lookup': {
        'from': 'partner', 
        'localField': 'partnerId', 
        'foreignField': '_id', 
        'as': 'partner'
      }
    }, {
      '$addFields': {
        'partner': {
          '$arrayElemAt': [
            '$partner', 0
          ]
        }
      }
    }, {
      '$addFields': {
        'type': {
          '$cond': [
            {
              '$isArray': '$partner.modules'
            }, '$partner.modules', []
          ]
        }
      }
    }, {
      '$project': {
        'partner': 0
      }
    }, 
    {
      $match: {
        branchType: toUpper(branchType),
      }
    },
    {
      '$sort': {
        'name': 1
      }
    }, {
      '$limit': 20
    }
  ]);

  const result: any[] = await makeQuery(BranchCollection.aggregate(aggs).exec());
  return map((result || []), (doc) => formatBranch(doc, language));
}

const createBranchUser = async (staff: any, branchId: string) => {
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
    branchId,
    groups,
  };
  const createdUser = await userService.createUserAccount(user);
  const userId = get(createdUser, '_id');
  await authService.assignUserToGroup(userId, groups || [], branchId);

  const staffInfo: any = {
    firstName,
    lastName,
    address,
    branchId,
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

const getBranchUsers = async (branchId: number, options: any) => {
  return employeeService.getEmployeeByBranchId(branchId, options)
}

const findBranchByPartnerId = async (partnerId: number) => {
  return makeQuery(BranchCollection.find({ partnerId: partnerId, deletedAt: null }).exec());
}

const findBranchById = async (branchId: number) => {
  return makeQuery(BranchCollection.findById(branchId).exec());
}

const findBranchBySlug = async (slug: string) => {
  return makeQuery(BranchCollection.findOne({ slug, deletedAt: null }).exec());
}


const findBranchAndChild = async (partnerId?: number, parentBranchId?: number, filter?: any) => {
  if(!parentBranchId && !partnerId) {
    return [];
  }
  let aggs: any[] = [];
  if (partnerId) {
    aggs.push({
      $match: {
        partnerId: Number(partnerId),
      }
    })
  }

  if (parentBranchId) {
    aggs.push({
      $match: {
        _id: Number(parentBranchId),
      }
    });
    aggs = aggs.concat([{
      '$graphLookup': {
        'from': 'branch',
        'startWith': '$_id',
        'connectFromField': '_id',
        'connectToField': 'parentId',
        'as': 'childBranches',
        'restrictSearchWithMatch': {
          'deletedAt': null
        }
      }
    }, {
      '$addFields': {
        'allBranches': {
          '$concatArrays': [
            '$childBranches', [
              '$$ROOT'
            ]
          ]
        }
      }
    }, {
      '$unwind': {
        'path': '$allBranches'
      }
    }, {
      '$replaceRoot': {
        'newRoot': '$allBranches'
      }
    }])
  }
  aggs.push({
    $match: {
      ...filter,
      deletedAt: null,
    }
  })
  // const aggregation = await BranchCollection.aggregate(aggs).exec();
  const result: any = await makeQuery(BranchCollection.aggregate(aggs).exec());

  // let branches: any[] = [];

  return map(result, (branch) => {
    const { address, ...rest } = branch;
    return {
      ...appUtil.mapLanguage(rest),
      address: addressUtil.formatAddressV2(address),
    }
  })
}


const getAvailableHospitalSlot = async (hospitalIdOrSlug: any, startRangeTime: number, endRangeTime: number) => {
  let query: any = {slug: hospitalIdOrSlug};
  if(typeof hospitalIdOrSlug === 'number') {
    query = { _id: hospitalIdOrSlug};
  }

  const result: any = {};
  const hospital = await BranchCollection.findOne(query).lean();
  const { workingHours, branchSettings } = hospital;
  const days = appUtil.enumerateDaysBetweenDates(startRangeTime, endRangeTime)
  const appointments = await AppointmentCollection.find({
    branchId: get(hospital, '_id'),
    time: {
      $gte: startRangeTime,
      $lte: endRangeTime
    },
    status: {
      $ne: 'CANCEL'
    }
  }).select('time').lean().exec();
  const slotTime = get(branchSettings, 'slotTime');
  const capacityPerSlot = get(branchSettings, 'capacityPerSlot');
  each(days, (day) => {
    const currentDay = moment(day, 'YYYYMMDD').utcOffset('+07:00');
    const todaySchedule = find(workingHours, ['weekDay', Number(currentDay.format('d'))]);
    const isOpen = get(todaySchedule, 'isOpen', false);
    const startTime = get(todaySchedule, 'startTime', false);
    const endTime = get(todaySchedule, 'endTime', false);
    const placedAppointments = filter(appointments, (app) => 
    moment(app.time).utcOffset('+07:00').valueOf() >= currentDay.startOf('day').valueOf() &&
    moment(app.time).utcOffset('+07:00').valueOf() <= currentDay.endOf('day').valueOf()
    );
    const placedTimes = countBy(map(placedAppointments, (d) => ({
      time: moment(get(d, 'time')).utcOffset('+07:00').format('HH:mm')
    })), 'time');
    if(isOpen) {
      result[day] = [];
      let currentTime = moment(startTime, 'HH:mm');
      let closingTime = moment(endTime, 'HH:mm');
      while (currentTime.isBefore(closingTime)) {
        if(get(placedTimes, currentTime.format('HH:mm'), 0) < capacityPerSlot){
          result[day].push(currentTime.format('HH:mm'))
        }
        currentTime.add(slotTime, 'minute');
      }
    }
  });

  return result;
}

export default {
  createBranch,
  fetchBranch,
  fetchBranchInfo,
  updateBranchInfo,
  deleteBranch,
  isBranch,
  getSimillarBranch,
  findBranchByCode,
  formatBranch,
  fetchBranchByType,
  createBranchUser,
  getBranchUsers,
  findBranchByPartnerId,
  findBranchById,
  findBranchAndChild,
  findBranchBySlug,
  getAvailableHospitalSlot,
};
