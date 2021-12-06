import loggerHelper from '@utils/logger.util';
import {get, sortBy} from 'lodash';
import ClinicServiceCollection from './clinicService.collection';
import {ClinicServiceModel} from './clinicServiceModel';
import {CLINIC_SERVICE_STATUS} from './constant';
import ServiceGroupCollection from '@modules/clinic-service-group/clinicServiceGroup.collection';
import {ClinicServiceGroupModel} from '@modules/clinic-service-group/clinicServiceGroup.model';
import mongoose from 'mongoose';

const logger = loggerHelper.getLogger('clinicService.service');

const createClinicService = async (clinicService: ClinicServiceModel, serviceGroupCode: string) => {
  logger.info(`Creating clinic service group. serviceGroupId[${clinicService.serviceGroupId}] partnerId[${clinicService.partnerId}] name[${clinicService.name}]`);
  clinicService.status = CLINIC_SERVICE_STATUS.ACTIVE;

  const persistedClinicService = await ClinicServiceCollection.create(clinicService);

  const clinicServiceCode = `${serviceGroupCode}-${persistedClinicService.clinicServiceCodeSequence}`;
  persistedClinicService.clinicServiceCode = clinicServiceCode;
  persistedClinicService.save();

  logger.info(`Created clinic service Code[${clinicServiceCode}]`);

  const {...rest} = get(persistedClinicService, '_doc', {});
  return {
    ...rest,
  };
}

const fetchClinicServices = async (branchId: number): Promise<ClinicServiceGroupModel[]> => {

  const query: any = {
    deletedAt: null,
    branchId
  }

  // Find service groups
  const serviceGroupDocuments = await ServiceGroupCollection.find(query, null, {
    sort: {
      name: 1
    }
  });
  if (serviceGroupDocuments.length === 0) {
    return [];
  }
  const serviceGroups: ClinicServiceGroupModel[] = serviceGroupDocuments.map((doc: any) => get(doc, '_doc') as ClinicServiceGroupModel);

  // find services
  const clinicServiceDocuments = await ClinicServiceCollection.find(query);
  if (clinicServiceDocuments.length === 0) {
    return serviceGroups;
  }
  const clinicServices: ClinicServiceModel[] = clinicServiceDocuments.map(doc => get(doc, '_doc') as ClinicServiceModel);
  for (const serviceGroup of serviceGroups) {
    const filteredService = clinicServices.filter(service => service.serviceGroupId === serviceGroup._id);
    serviceGroup.clinicServices = sortBy(filteredService, ['name']);
  }

  return serviceGroups
}

const fetchClinicServicesByGroupIdAndPartnerId = async (serviceGroupId: string, companyId: number, options: any) => {

  const query: any = {
    deletedAt: null,
    partnerId: companyId,
    serviceGroupId
  }

  const clinicServices = await ClinicServiceCollection.paginate(query, {
    ...options,
    sort: {
      name: 1,
    }
  });
  const {docs, ...rest} = clinicServices
  return {
    docs,
    ...rest
  };
}

const findClinicService = async (serviceId: string, branchId: number) => {
  const query = {
    _id: serviceId,
    branchId,
    deletedAt: null
  }
  return await getClinicServiceInfo(query);
};

const getClinicServiceInfo = async (query: any) => {
  return await ClinicServiceCollection.findOne(query).exec();
};

const updateServiceGroupInfo = async (query: any, ServiceGroupInfo: any, changeGroupId: boolean, serviceGroupCode?: string) => {
  let result: any;
  const session: any = await mongoose.startSession();
  await session.withTransaction(async () => {
    const clinicService = await ClinicServiceCollection.findOneAndUpdate(query,
      {$set: ServiceGroupInfo},
      {
        new: true,
        session
      });
    if (changeGroupId) {
      await new Promise(((resolve, reject) => {
        clinicService.setNext('clinic_service_code_sequence', async function (err: any, service: any) {
          if (err) {
            reject(err);
          }
          service.clinicServiceCode = `${serviceGroupCode}-${service.clinicServiceCodeSequence}`;
          await service.save({session});
          resolve(service);
        })
      })).catch(err => {
        throw err;
      })
    }
    result = clinicService;
  });

  const {createdAt, updatedAt, ...rest} = get(result, '_doc', {});
  return {
    ...rest,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteClinicService = async (clinicServiceId: string, branchId: number) => {
  await ClinicServiceCollection.findOneAndUpdate({
    _id: clinicServiceId,
    branchId
  }, {
    deletedAt: new Date(),
    status: CLINIC_SERVICE_STATUS.INACTIVE
  });

  return true;
};

export default {
  createClinicService,
  getServiceGroupInfo: getClinicServiceInfo,
  updateServiceGroupInfo,
  delete: deleteClinicService,
  fetchClinicServices,
  findClinicService,
  fetchClinicServicesByGroupIdAndPartnerId
};
