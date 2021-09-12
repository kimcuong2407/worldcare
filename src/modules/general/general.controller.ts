import { MEDICAL_SERVICE } from './../../core/constant/index';
import { setResponse } from '../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import generalService from './general.service';
import map from 'lodash/map';
import pick from 'lodash/pick';
import newsService from '../news/news.service';
import hospitalService from '../hospital/hospital.service';
import staffService from '../staff/staff.service';
import configurationService from '../configuration/configuration.service';
import { find } from 'lodash';
import { EMPLOYEE_GROUP } from '../configuration/constant';
import branchService from '../branch/branch.service';

const logger = loggerHelper.getLogger('general.controller');

const fetchHomepageContentAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const language: string = get(req, 'language');

    const clinicAppointment = await generalService.getSpecialityAndHospital(MEDICAL_SERVICE.CLINIC_APPOINTMENT, language);
    const doctorAtHome = await generalService.getSpecialityAndHospital(MEDICAL_SERVICE.DOCTOR_AT_HOME, language);
    const employeeGroups = await configurationService.getEmployeeGroup([], language);
    const doctorGroup = find(employeeGroups, (eg) => eg.key === EMPLOYEE_GROUP.DOCTOR);
    const nursingGroup = find(employeeGroups, (eg) => eg.key === EMPLOYEE_GROUP.NURSING);

    const { docs: doctors } = await staffService.fetchStaff({
      options: {limit: 10},
      employeeGroup: get(doctorGroup, '_id')
    }, language);
    const { docs: nursing } = await staffService.fetchStaff({
      options: {limit: 3},
      employeeGroup: get(nursingGroup, '_id')
    }, language);

    const { docs: hospitals } = await branchService.fetchBranch({
      options: {limit: 10}
    }, language);

    const { docs: latestNews} = await newsService.getNews({
      options: {
        limit: 5,
      }
    }, language);

    res.send({
      clinicAppointment,
      doctorAtHome,
      latestNews,
      hospitals,
      doctors,
      nursing,
    });
  } catch (e) {
    logger.error('createAppointmentAction', e);
    next(e);
  }
};


export default {
  fetchHomepageContentAction
}