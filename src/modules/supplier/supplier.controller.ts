import express from 'express';
import loggerHelper from '@utils/logger.util';
import supplierService from './supplier.service';
import get from 'lodash/get';
import appUtil from '@app/utils/app.util';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';
import { isEmpty, isNil } from 'lodash';
import SupplierGroupCollection from '@modules/supplier-group/supplierGroup.collection';

const logger = loggerHelper.getLogger('supplier.controller');

const createSupplierAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      supplierCode,
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      note,
      supplierGroupId
    } = req.body;

    const partnerId = req.user.partnerId;
    
    const supplierInfo: any = {
      supplierCode,
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      note,
      partnerId,
      supplierGroupId
    };
    

    await validateSupplier(supplierInfo, true);

    const data = await supplierService.createSupplier(supplierInfo);
    logger.info(`Created supplier with ID=${get(data, '_id')} and name=${data.name}`);
    res.send(data);
  } catch (e) {
    logger.error('Error while creating new supplier', e);
    next(e);
  }
};

const validateSupplier = async (supplierInfo: any, isCreating: boolean) => {
  if (!supplierInfo.name) {
    throw new ValidationFailedError('Supplier name is required.');
  }
  if (!supplierInfo.address || !supplierInfo.address.street) {
    throw new ValidationFailedError('Supplier address is required.');
  }
  if (!supplierInfo.phoneNumber) {
    throw new ValidationFailedError('Supplier phone number is required.');
  }
  if (supplierInfo.supplierGroupId) {
    const supplierGroup = await SupplierGroupCollection.findOne({
      _id: supplierInfo.supplierGroupId,
      partnerId: supplierInfo.partnerId
    });
    if (isNil(supplierGroup)) {
      throw new ValidationFailedError('Supplier group does not exist.');
    }
  }

  if (isCreating) {
    const supplier = await supplierService.getSupplierInfo({name: supplierInfo.name, partnerId: supplierInfo.partnerId});
    if (supplier && Object.keys(supplier).length !== 0) {
      throw new ValidationFailedError(`Supplier with name ${supplierInfo.name} is existed.`);
    }
    const supplierCode = get(supplierInfo, 'supplierCode', null);
    if (!isNil(supplierCode)) {
      const query = { supplierCode };
      const doc = await supplierService.getSupplierInfo(query);
      if (!isEmpty(doc)) {
        throw new ValidationFailedError(`The supplierCode ${supplierCode} is exieted.`);
      }
    }
  }
}

const fetchSuppliersAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    const {keyword, supplierCode, name, phoneNumber, email} = req.query;
    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const supplierQuery: any = {
      keyword,
      supplierCode,
      name,
      phoneNumber,
      email,
      partnerId
    }
    const data = await supplierService.fetchSuppliers(supplierQuery, options);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while fetching suppliers', e);
    next(e);
  }
};

const getSupplierByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;
    let supplierId = get(req.params, 'supplierId');
    const query: any = {
      _id: supplierId,
      partnerId
    }
    const supplier = await supplierService.getSupplierInfo(query);
    if (!supplier || Object.keys(supplier).length === 0) {
      throw new NotFoundError();
    }

    res.send(supplier);
  } catch (e) {
    logger.error('There was an error while get supplier by ID', e);
    next(e);
  }
};

const updateSupplierInfoAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    const {
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      note,
      supplierGroupId
    } = req.body;

    const supplierInfo: any = {
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      note,
      supplierGroupId
    };

    await validateSupplier(supplierInfo, false);

    let supplierId = get(req.params, 'supplierId');
    const query: any = {
      _id: supplierId,
      partnerId
    }
    const existedSupplier = await supplierService.getSupplierInfo(query);
    if (!existedSupplier || Object.keys(existedSupplier).length === 0) {
      throw new NotFoundError();
    }

    if (existedSupplier.name !== supplierInfo.name) {
      const supplier = await supplierService.getSupplierInfo({
        '$and': [{name}, {_id: {'$ne': supplierId}}, {partnerId}]
      });
      if (supplier && Object.keys(supplier).length !== 0) {
        throw new ValidationFailedError(`Supplier with name ${name} is existed.`);
      }
    }

    const data = await supplierService.updateSupplierInfo(query, supplierInfo);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while updating supplier', e);
    next(e);
  }
};

const deleteSupplierAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const partnerId = req.user.partnerId;

    let supplierId = get(req.params, 'supplierId');
    const query: any = {
      _id: supplierId,
      partnerId
    }
    const supplier = await supplierService.getSupplierInfo(query);
    if (!supplier || Object.keys(supplier).length === 0) {
      throw new NotFoundError();
    }

    const data = await supplierService.deleteSupplier(supplierId);
    res.send(data);
  } catch (e) {
    logger.error('There was an error while deleting supplier', e);
    next(e);
  }
}


export default {
  createSupplierAction,
  fetchSuppliersAction,
  getSupplierByIdAction,
  updateSupplierInfoAction,
  deleteSupplierAction,
};
