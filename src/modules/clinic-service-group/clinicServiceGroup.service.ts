import loggerHelper from '@utils/logger.util';
import get from 'lodash/get';
import ClinicServiceGroupCollection from './clinicServiceGroup.collection';
import {ClinicServiceGroupModel} from './clinicServiceGroup.model';
import {CLINIC_SERVICE_GROUP_STATUS} from './constant';

const logger = loggerHelper.getLogger('serviceGroup.service');

const createServiceGroup = async (serviceGroup: ClinicServiceGroupModel) => {
  logger.info(`Creating clinic service group branchId[${serviceGroup.branchId}] name[${serviceGroup.name}]`);
  serviceGroup.status = CLINIC_SERVICE_GROUP_STATUS.ACTIVE;

  const persistedServiceGroup = await ClinicServiceGroupCollection.create(serviceGroup);

  const serviceGroupCode = initServiceGroupCode(persistedServiceGroup.clinicServiceGroupCodeSequence);
  persistedServiceGroup.serviceGroupCode = serviceGroupCode;
  persistedServiceGroup.save();
  
  logger.info(`Created clinic service group ID[${serviceGroupCode}]`);

  const {...rest} = get(persistedServiceGroup, '_doc', {});
  return {
    ...rest,
  };
}

const initServiceGroupCode = (serviceGroupCodeSeq: number) => {
  const s = '000000000' + serviceGroupCodeSeq;
  const zeroPrefix = s.substr(s.length - 6);
  return 'DV' + zeroPrefix;
}

const fetchServiceGroups = async (companyId: number) => {

  const query: any = {
    deletedAt: null,
    branchId: companyId
  }

  const serviceGroups = await ClinicServiceGroupCollection.find(query, null, {
    sort: {
      name: 1,
    }
  });
  return serviceGroups.map(doc => get(doc, '_doc'));
}

const findServiceGroupInfoByGroupIdAndBranchId = async (serviceGroupId: string, branchId: number) => {
  const query = {
    _id: serviceGroupId,
    branchId
  }
  return await getServiceGroupInfo(query);
};

const getServiceGroupInfo = async (query: any) => {
  return await ClinicServiceGroupCollection.findOne(query).exec();
};

const updateServiceGroupInfo = async (query: any, ServiceGroupInfo: any) => {
  const serviceGroup = await ClinicServiceGroupCollection.findOneAndUpdate(query, {$set: ServiceGroupInfo}, {new: true});

  const {createdAt, updatedAt, ...rest} = get(serviceGroup, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteServiceGroup = async (serviceGroupId: string, branchId: number) => {
  await ClinicServiceGroupCollection.findOneAndUpdate({
    _id: serviceGroupId,
    branchId
  }, {
    deletedAt: new Date(),
    status: CLINIC_SERVICE_GROUP_STATUS.INACTIVE
  });

  return true;
};

export default {
  createServiceGroup,
  getServiceGroupInfo,
  updateServiceGroupInfo,
  delete: deleteServiceGroup,
  fetchServiceGroups,
  findServiceGroupInfoByGroupIdAndBranchId
};
