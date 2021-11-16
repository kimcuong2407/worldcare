import express from 'express';
import loggerHelper from '@utils/logger.util';
import serviceGroupService from './clinicServiceGroup.service';
import get from 'lodash/get';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('serviceGroup.controller');

const createServiceGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Clinic service group name is required.');
    }
    if (!req.companyId) {
      throw new ValidationFailedError('Branch ID is required.');
    }

    const clinicServiceGroupInfo: any = {
      name,
      description,
      branchId: req.companyId
    }

    const data = await serviceGroupService.createServiceGroup(clinicServiceGroupInfo);

    res.send(data);
  } catch (e) {
    logger.error('Error while creating new service group', e);
    next(e);
  }
};

const fetchServiceGroupsAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      throw new ValidationFailedError('Branch ID is required.');
    }
    const data = await serviceGroupService.fetchServiceGroups(companyId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while fetching service groups', e);
    next(e);
  }
};

const getServiceGroupByCodeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceGroupId = get(req.params, 'serviceGroupId');
    const companyId = req.companyId;
    if (!companyId) {
      throw new ValidationFailedError('Branch ID is required.');
    }
    const serviceGroup = await serviceGroupService.findServiceGroupInfoByGroupIdAndBranchId(serviceGroupId, companyId);
    if (!serviceGroup || Object.keys(serviceGroup).length === 0) {
      throw new NotFoundError();
    }

    res.send(serviceGroup);
  } catch (e) {
    logger.error('There was an error while get service group by Code', e);
    next(e);
  }
};

const updateServiceGroupInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name) {
      throw new ValidationFailedError('Service group name is required.');
    }
    const companyId = req.companyId;
    if (!companyId) {
      throw new ValidationFailedError('Branch ID is required.');
    }
    let serviceGroupId = get(req.params, 'serviceGroupId');
    if (!serviceGroupId) {
      throw new ValidationFailedError('Service group id is required.');
    }
    logger.info(`Updating ServiceGroup ID[${serviceGroupId}] branchId[${req.companyId}]`)

    const serviceGroupInfo: any = {
      name,
      description,
      branchId: companyId
    }

    const existedServiceGroup = await serviceGroupService.findServiceGroupInfoByGroupIdAndBranchId(serviceGroupId, companyId);

    if (!existedServiceGroup || Object.keys(existedServiceGroup).length === 0) {
      throw new NotFoundError();
    }

    const data = await serviceGroupService.updateServiceGroupInfo({_id: serviceGroupId, branchId: req.companyId}, serviceGroupInfo);
    logger.info(`Updated ServiceGroup ID[${serviceGroupId}] branchId[${req.companyId}]`)
    res.send(data);
  } catch (e) {
    logger.error('There was an error while updating service group', e);
    next(e);
  }
};

const deleteServiceGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const serviceGroupId = get(req.params, 'serviceGroupId');
    const companyId = req.companyId;
    if (!companyId) {
      throw new ValidationFailedError('Branch ID is required.');
    }
    const serviceGroup = await serviceGroupService.findServiceGroupInfoByGroupIdAndBranchId(serviceGroupId, companyId);
    if (!serviceGroup || Object.keys(serviceGroup).length === 0) {
      throw new NotFoundError();
    }

    const data = await serviceGroupService.delete(serviceGroupId, companyId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while deleting service group', e);
    next(e);
  }
}


export default {
  fetchServiceGroupsAction,
  getServiceGroupByCodeAction,
  createServiceGroupAction,
  updateServiceGroupInfoAction,
  deleteServiceGroupAction,
};
