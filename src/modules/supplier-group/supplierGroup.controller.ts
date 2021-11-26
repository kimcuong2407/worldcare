import express from 'express';
import loggerHelper from '@utils/logger.util';
import supplierGroupService from './supplierGroup.service';
import get from 'lodash/get';
import appUtil from '@app/utils/app.util';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('supplierGroup.controller');

const createSupplierGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name || name.trim().length === 0) {
      throw new ValidationFailedError('Supplier group name is required.');
    }

    const partnerId = req.user.partnerId;
    
    const supplierGroupInfo: any = {
      name,
      description,
      partnerId
    };

    const data = await supplierGroupService.createSupplierGroup(supplierGroupInfo);
    logger.info(`Created supplier group with ID=${get(data, '_id')} and name=${data.name}`);
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier group', e);
    next(e);
  }
};

const fetchSuppliersAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    const {keyword, name} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const supplierQuery: any = {
      keyword,
      name,
      partnerId
    }
    const data = await supplierGroupService.fetchSupplierGroups(supplierQuery, options);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while fetching supplier groups', e);
    next(e);
  }
};

const getSupplierGroupByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;
    let supplierGroupId = get(req.params, 'supplierGroupId');
    const query: any = {
      _id: supplierGroupId,
      partnerId
    }
    const supplier = await supplierGroupService.getSupplierGroupInfo(query);
    if (!supplier || Object.keys(supplier).length === 0) {
      throw new NotFoundError();
    }

    res.send(supplier);
  } catch (e) {
    logger.error('There was an error while get supplier group by ID', e);
    next(e);
  }
};

const updateSupplierGroupInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    const {
      name,
      description
    } = req.body;
    if (!name || name.trim().length === 0) {
      throw new ValidationFailedError('Supplier group name is required.');
    }

    const supplierGroupInfo: any = {
      name,
      description
    };

    let supplierGroupId = get(req.params, 'supplierGroupId');
    const query: any = {
      _id: supplierGroupId,
      partnerId
    }
    const existedSupplierGroup = await supplierGroupService.getSupplierGroupInfo(query);
    if (!existedSupplierGroup || Object.keys(existedSupplierGroup).length === 0) {
      throw new NotFoundError();
    }

    const data = await supplierGroupService.updateSupplierGroupInfo(query, supplierGroupInfo);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while updating supplier group', e);
    next(e);
  }
};

const deleteSupplierGroupAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    let supplierGroupId = get(req.params, 'supplierGroupId');
    const query: any = {
      _id: supplierGroupId,
      partnerId
    }
    const supplierGroup = await supplierGroupService.getSupplierGroupInfo(query);
    if (!supplierGroup || Object.keys(supplierGroup).length === 0) {
      throw new NotFoundError();
    }

    const data = await supplierGroupService.deleteSupplierGroup(supplierGroupId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while deleting supplier group', e);
    next(e);
  }
}


export default {
  create: createSupplierGroupAction,
  fetchSuppliersAction,
  getSupplierGroupByIdAction,
  updateSupplierGroupInfoAction,
  deleteSupplierGroupAction,
};
