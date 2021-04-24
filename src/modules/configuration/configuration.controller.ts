import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import configurationService from './configuration.service';
import map from 'lodash/map';
import pick from 'lodash/pick';
import subVN from 'sub-vn';

const logger = loggerHelper.getLogger('degree.controller');

// DEGREE
const createDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await configurationService.createDegree(req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const updateDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await configurationService.updateDegreeById(degreeId, req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const fetchDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await configurationService.getDegree(
      [
        'name',
        'incrementId'
      ]
    );
    res.send(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const getDegreeByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await configurationService.getDegreeById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


// TITLE
const createTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const title = await configurationService.createTitle(req.body);

    res.send(title);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const updateTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const titleId = get(req.params, 'id');
    const title = await configurationService.updateTitleById(titleId, req.body);

    res.send(title);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const fetchTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const titles = await configurationService.getTitle(
      [
        'name',
        'incrementId'
      ]
    );

    res.send(map(titles, (degree) => pick(degree, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const getTitleByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const titleId = get(req.params, 'id');
    const title = await configurationService.getTitleById(titleId);
    res.send(title);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


// SPECIALITY
const createSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const speciality = await configurationService.createSpeciality(req.body);

    res.send(speciality);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const updateSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const specialityId = get(req.params, 'id');
    const speciality = await configurationService.updateSpecialityById(specialityId, req.body);

    res.send(speciality);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const fetchSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const specialities = await configurationService.getSpeciality(
      [
        'name',
        'incrementId'
      ]
    );

    res.send(map(specialities, (speciality) => pick(speciality, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const getSpecialityByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const specialityId = get(req.params, 'id');
    const speciality = await configurationService.getSpecialityById(specialityId);
    res.send(speciality);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


// EMPLOYEE
const createEmployeeTypeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const employeeType = await configurationService.createEmployeeType(req.body);

    res.send(employeeType);
  } catch (e) {
    logger.error('createEmployeeTypeAction', e);
    next(e);
  }
};


const updateEmployeeTypeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const employeeTypeId = get(req.params, 'id');
    const employeeType = await configurationService.updateEmployeeTypeById(employeeTypeId, req.body);

    res.send(employeeType);
  } catch (e) {
    logger.error('createEmployeeTypeAction', e);
    next(e);
  }
};


const fetchEmployeeTypeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const employeeTypes = await configurationService.getEmployeeType(
      [
        'name',
        'incrementId'
      ]
    );
    res.send(map(employeeTypes, (employeeType) => pick(employeeType, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const getEmployeeTypeByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const employeeTypeId = get(req.params, 'id');
    const employeeType = await configurationService.getEmployeeTypeById(employeeTypeId);
    res.send(employeeType);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};



const getCityListAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const cities = subVN.getProvinces();
    res.send(cities);
  } catch (e) {
    logger.error('getCityListAction', e);
    next(e);
  }
};


const getDistrictListAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const cityCode = get(req.params, 'cityCode')
    const district = subVN.getDistrictsByProvinceCode(cityCode);
    res.send(district);
  } catch (e) {
    logger.error('getCityListAction', e);
    next(e);
  }
};

const getWardListByDistrictAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const districtCode = get(req.params, 'districtCode')
    const district = subVN.getWardsByDistrictCode(districtCode);
    res.send(district);
  } catch (e) {
    logger.error('getCityListAction', e);
    next(e);
  }
};


export default {
  createDegreeAction, fetchDegreeAction, updateDegreeAction, getDegreeByIdAction,
  createTitleAction, fetchTitleAction, updateTitleAction, getTitleByIdAction,
  createSpecialityAction, fetchSpecialityAction, updateSpecialityAction, getSpecialityByIdAction,
  createEmployeeTypeAction, fetchEmployeeTypeAction, updateEmployeeTypeAction, getEmployeeTypeByIdAction,
  getCityListAction,
  getDistrictListAction,
  getWardListByDistrictAction,
};

