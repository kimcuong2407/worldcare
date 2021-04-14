import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import degreeService from './configuration.service';
import map from 'lodash/map';
import pick from 'lodash/pick';

const logger = loggerHelper.getLogger('degree.controller');

const createDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await degreeService.createDegree(req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const updateDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.updateDegreeById(degreeId, req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const fetchDegreeAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await degreeService.getDegree(
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
    const degree = await degreeService.getDegreeById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('createDegreeAction', e);
    next(e);
  }
};


const createTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await degreeService.createTitle(req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const updateTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.updateTitleById(degreeId, req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const fetchTitleAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await degreeService.getTitle(
      [
        'name',
        'incrementId'
      ]
    );

    res.send(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};


const getTitleByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.getTitleById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('createTitleAction', e);
    next(e);
  }
};



const createSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degree = await degreeService.createSpeciality(req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const updateSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.updateSpecialityById(degreeId, req.body);

    res.send(degree);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const fetchSpecialityAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degrees = await degreeService.getSpeciality(
      [
        'name',
        'incrementId'
      ]
    );

    res.send(map(degrees, (degree) => pick(degree, ['name', 'id', 'incrementId'])));
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};


const getSpecialityByIdAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const degreeId = get(req.params, 'id');
    const degree = await degreeService.getSpecialityById(degreeId);
    res.send(degree);
  } catch (e) {
    logger.error('createSpecialityAction', e);
    next(e);
  }
};
export default {
  createDegreeAction, fetchDegreeAction, updateDegreeAction, getDegreeByIdAction,
  createTitleAction, fetchTitleAction, updateTitleAction, getTitleByIdAction,
  
  createSpecialityAction, fetchSpecialityAction, updateSpecialityAction, getSpecialityByIdAction,
};

