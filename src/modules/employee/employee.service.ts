import addressUtil from '@app/utils/address.util';
import loggerHelper from '@utils/logger.util';
import { map, pick } from 'lodash';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Types } from 'mongoose';
import authService from '../auth/auth.service';
import HospitalCollection from '../hospital/hospital.collection';
import hospitalService from '../hospital/hospital.service';
import userService from '../user/user.service';
import EmployeeCollection from './employee.collection';
import { EmployeeModel } from './employee.model';

const logger = loggerHelper.getLogger('staff.service');

const createEmployee = async (staffInfo: any) => {
  const staff = await EmployeeCollection.create(staffInfo);
  const { createdAt, updatedAt, ...rest } = get(staff, '_doc', {});
  return {
    ...rest,
  };
};

const formatEmployee = (staff: any) => {
  // staff = staff.toJSON();
  if(!staff) {
    return {};
  }
  const { userId, ...rest } = staff || {};
  const address = addressUtil.formatAddressV2(get(staff, 'address'));
  return {
    ...pick(userId, ['groups', 'username']),
    ...rest,
    address,
  }
}

const fetchEmployee = async (params: any, language = 'vi') => {
  const {
    keyword, options, hospitalId, title, degree, speciality, employeeGroup
  } = params;
  const query: any = {
  };

  if (hospitalId) {
    query.hospital = hospitalId;
  }
  if (degree) {
    query.degree = degree;
  }
  if (title) {
    query.title = title;
  }
  if (title) {
    query.degree = title;
  }
  if (speciality) {
    query.speciality = speciality;
  }
  if (employeeGroup) {
    query.employeeGroup = employeeGroup;
  }

  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  EmployeeCollection.setDefaultLanguage(language);
  let data = await EmployeeCollection.paginate(query, {
    ...options,
    'populate': [
      { path: 'hospital', select: ['hospitalName', 'address', 'workingHours'] },
      { path: 'degree.degreeId', select: 'name' },
      { path: 'title', select: 'name' },
      { path: 'speciality', select: 'name' },
      { path: 'employee_group', select: 'name' },
    ],
  });
  const { docs, ...rest } = data
  return {
    docs: map(docs, formatEmployee),
    ...rest
  };
}

const getEmployeeInfo = async (query: any, isRaw = false) => {
  // EmployeeCollection.setDefaultLanguage(language);
  let staff;

  if (isRaw) {
    const employee = await EmployeeCollection.findOne(query).populate('userId').lean().exec();
    return formatEmployee(employee);
  }

  staff = await EmployeeCollection.findOne(query)
    .populate('degree.degreeId', 'name')
    .populate('title', 'name')
    .populate('speciality', 'name')
    .populate('employeeGroup', 'name')
    .populate('userId').exec();
  return formatEmployee(staff);
};

const updateEmployeeGroups = async(userId: string, groups: [string], branchId: string) =>{
  await authService.removeRoleForUser(userId, branchId);
  return authService.assignUserToGroup(userId, groups, branchId);
}

const updateEmployeeInfo = async (query: any, staffInfo: any) => {
  const { username, groups, userId, ...info } = staffInfo;
  const staff = await EmployeeCollection.findOneAndUpdate(query, info, { new: true });
  
  const { createdAt, updatedAt, ...rest } = get(staff, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteEmployee = async (staffId: string) => {
  const data = await EmployeeCollection.findByIdAndDelete(staffId);
  if (isNull(data)) {
    const data = await EmployeeCollection.findById(staffId);
    if (!data) {
      throw new Error('There is no staffId!');
    }
  }
  return true;
};


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

  return await createEmployee(staffInfo);
}

const getEmployeeByBranchId = async (query: any, options: any) => {
  const { branchId, ...matchQuery } = query;
  const aggregation: any = [
    {
      '$match': {
        'branchId': Number(branchId)
      }
    }, {
      '$lookup': {
        'from': 'user',
        'let': {
          'userId': '$userId'
        },
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$eq': [
                  '$_id', '$$userId'
                ]
              }
            }
          }, {
            '$project': {
              'username': 1,
              'groups': 1
            }
          }
        ],
        'as': 'user'
      }
    }, {
      '$addFields': {
        'user': {
          '$arrayElemAt': [
            '$user', 0
          ]
        }
      }
    }, {
      '$addFields': {
        'username': '$user.username',
        'groups': {
          '$cond': [
            { '$isArray': "$user.groups" },
            "$user.groups",
            []
          ]
        }
      }
    }, {
      '$lookup': {
        'from': 'role',
        'let': {
          'groups': '$groups'
        },
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$in': [
                  '$_id', '$$groups'
                ]
              }
            }
          }, {
            '$project': {
              'name': 1
            }
          }
        ],
        'as': 'groups'
      }
    }, {
      '$unset': [
        'user'
      ]
    }, {
      '$match': {
        ...matchQuery,
      }
    }
  ];

  const employees = await EmployeeCollection.aggregatePaginate(EmployeeCollection.aggregate(aggregation), {
    ...options
  });
  const { docs, ...rest } = employees;
  return {
    ...rest,
    docs: map(docs || [], ({ address, ...rest }) => ({ ...rest, address: addressUtil.formatAddressV2(address) }))
  };
}

export default {
  createEmployee,
  fetchEmployee,
  getEmployeeInfo,
  updateEmployeeInfo,
  deleteEmployee,
  getEmployeeByBranchId,
  createBranchUser,
  updateEmployeeGroups,
};
