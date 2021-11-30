import express from 'express';
import loggerHelper from '@utils/logger.util';
import clinicServiceService from './clinicService.service';
import serviceGroupService from '../clinic-service-group/clinicServiceGroup.service';
import {get, isNil} from 'lodash';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('serviceGroup.controller');

const createClinicServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      priceUnit,
      serviceGroupId
    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Clinic service name is required.');
    }
    if (!serviceGroupId) {
      throw new ValidationFailedError('Service group ID is required.');
    }
    const branchId = req.companyId;
    const serviceGroup = await serviceGroupService.findServiceGroupInfoByGroupIdAndBranchId(serviceGroupId, branchId)
    if (isNil(serviceGroup) || Object.keys(serviceGroup).length !== 0) {
      throw new ValidationFailedError('Service group is not found.');
    }

    const clinicServiceInfo: any = {
      name,
      description,
      branchId,
      price,
      priceUnit,
      serviceGroupId,
      createdBy: req.user.id
    }

    const data = await clinicServiceService.createClinicService(clinicServiceInfo, serviceGroup.serviceGroupCode);

    res.send(data);
  } catch (e) {
    logger.error('Error while creating new service group', e);
    next(e);
  }
};

const fetchClinicServicesAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const branchId = req.companyId;
    const data = await clinicServiceService.fetchClinicServices(branchId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while fetching service groups', e);
    next(e);
  }
}

const getServiceByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceId = get(req.params, 'clinicServiceId');
    const branchId = req.companyId;
    if (!branchId) {
      throw new ValidationFailedError('Branch ID is required.');
    }
    const clinicService = await clinicServiceService.findClinicService(serviceId, branchId);
    if (!clinicService || Object.keys(clinicService).length !== 0) {
      throw new NotFoundError();
    }

    res.send(clinicService);
  } catch (e) {
    logger.error('There was an error while get service group by Code', e);
    next(e);
  }
};

const updateClinicServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      priceUnit,
      serviceGroupId
    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Clinic service name is required.');
    }
    if (!serviceGroupId) {
      throw new ValidationFailedError('Service group ID is required.');
    }
    const branchId = req.companyId;
    const serviceGroup = await serviceGroupService.findServiceGroupInfoByGroupIdAndBranchId(serviceGroupId, branchId)
    if (isNil(serviceGroup) || Object.keys(serviceGroup).length !== 0) {
      throw new ValidationFailedError('Service group is not found.');
    }

    const serviceId = get(req.params, 'clinicServiceId');
    const existedService = await clinicServiceService.findClinicService(serviceId, branchId);

    if (!existedService) {
      throw new NotFoundError();
    }

    const clinicServiceInfo: any = {
      name,
      description,
      price,
      priceUnit,
      updatedBy: req.user.id,
      serviceGroupId
    }

    const changeGroupId = serviceGroupId !== existedService.serviceGroupId
    const data = await clinicServiceService.updateServiceGroupInfo({
      _id: serviceId,
      branchId
    }, clinicServiceInfo, changeGroupId, serviceGroup.serviceGroupCode);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while updating service group', e);
    next(e);
  }
};

const deleteClinicServiceAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const clinicServiceId = get(req.params, 'clinicServiceId');
    const branchId = req.companyId;

    const clinicService = await clinicServiceService.findClinicService(clinicServiceId, branchId);
    if (!clinicService || Object.keys(clinicService).length !== 0) {
      throw new NotFoundError();
    }

    const data = await clinicServiceService.delete(clinicServiceId, branchId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while deleting service group', e);
    next(e);
  }
}


export default {
  fetchClinicServicesAction,
  getServiceByIdAction: getServiceByIdAction,
  create: createClinicServiceAction,
  updateClinicServiceAction: updateClinicServiceAction,
  delete: deleteClinicServiceAction,
};
