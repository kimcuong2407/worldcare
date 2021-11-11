import express from 'express';
import loggerHelper from '@utils/logger.util';
import supplierService from './supplier.service';
import get from 'lodash/get';
import appUtil from '@app/utils/app.util';
import {NotFoundError, ValidationFailedError} from '@app/core/types/ErrorTypes';
import { isEmpty, isNil } from 'lodash';

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
      supplierGroup,
      note
    } = req.body;

    const supplierInfo: any = {
      supplierCode,
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      supplierGroup,
      note
    };

    await validateSupplier(supplierInfo, true);

    const data = await supplierService.createSupplier(supplierInfo);
    logger.info(`Created supplier with ID=${supplierInfo.supplierCode} and name =${supplierInfo.name}`);
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

  if (isCreating) {
    const supplier = await supplierService.getSupplierInfo({name: supplierInfo.name});
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
      email
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
    let supplierCode = get(req.params, 'supplierCode');
    const query: any = {
      supplierCode,
    }
    const supplier = await supplierService.getSupplierInfo(query);
    if (!supplier) {
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
    const {
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      supplierGroup,
      note
    } = req.body;

    const supplierInfo: any = {
      name,
      phoneNumber,
      email,
      company,
      address,
      taxIdentificationNumber,
      supplierGroup,
      note
    };

    await validateSupplier(supplierInfo, false);

    let supplierCode = get(req.params, 'supplierCode');
    const query: any = {
      supplierCode,
    }
    const existedSupplier = await supplierService.getSupplierInfo(query);
    if (!existedSupplier) {
      throw new NotFoundError();
    }

    if (existedSupplier.name !== supplierInfo.name) {
      const supplier = await supplierService.getSupplierInfo({
        '$and': [{name}, {supplierCode: {'$ne': supplierCode}}]
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
    let supplierCode = get(req.params, 'supplierCode');
    const query: any = {
      supplierCode,
    }
    const supplier = await supplierService.getSupplierInfo(query);
    if (!supplier) {
      throw new NotFoundError();
    }

    const data = await supplierService.deleteSupplier(supplierCode);
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
