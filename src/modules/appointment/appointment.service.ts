import { UnAuthenticated } from '@app/core/types/ErrorTypes';
import zalo from '@app/core/zalo';
import bcryptUtil from '@app/utils/bcrypt.util';
import jwtUtil from '@app/utils/jwt.util';
import { get, isNil, omitBy } from 'lodash';
import moment from 'moment';
import { Query, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import SpecialityCollection from '../configuration/speciality.collection';
import hospitalService from '../hospital/hospital.service';
import AppointmentCollection from './appointment.collection';
import CustomerCollection from './customer.collection';

// DEGREE
const createAppointment = async (appointment: any) => {
  const { customer, time, serviceId, hospitalId, message, source, specialityId } = appointment;
  const { phoneNumber, name, email } = customer || {};
  const speciality = await SpecialityCollection.findById(specialityId).lean();

  const customerInfo = await CustomerCollection.findOneAndUpdate(
    { phoneNumber, name },
    { phoneNumber, name, email },
    { upsert: true, new: true }).exec();
  const hospital = await hospitalService.fetchHospitalInfo(hospitalId);
  const createdAppointment = await AppointmentCollection.create({
    customer: get(customerInfo, '_id'),
    time,
    service: serviceId,
    hospital: hospitalId,
    message,
    source,
    speciality: specialityId,
    serviceType: get(speciality, 'service'),
  });
  await zalo.sendZaloMessage(`Khách hàng ${name} vừa thực hiện đặt lịch tại ${get(hospital, 'hospitalName')} 
    vào lúc ${moment(time).utcOffset('+07:00').format('DD/MM/YYYY hh:mm')}`);
  const data = await getAppointmentById(createdAppointment._id);
  return data;
}

const fetchAppointment = async (startTime, endTime, serviceId, specialityId, hospitalId, status, source) => {
  const query: any = {};
  const andQuery = [];
  andQuery.push({
    deletedAt: null
  })
  if (startTime) {
    andQuery.push({
      time: { $gte: startTime }
    });
  }
  if (endTime) {
    andQuery.push({
      time: { $lte: startTime }
    });
  }
  if (status) {
    andQuery.push({
      status: status
    });
  }
  if (source) {
    andQuery.push({
      source: source
    });
  }
  if (hospitalId) {
    andQuery.push({
      hospital: hospitalId
    });
  }
  if (serviceId) {
    andQuery.push({
      service: serviceId
    });
  }
  if (specialityId) {
    andQuery.push({
      speciality: specialityId
    });
  }
  
  if (andQuery && andQuery.length) {
    query['$and'] = andQuery;
  }

  const data = await AppointmentCollection.find(query)
    .populate('customer', ['name', 'phoneNumber'])
    .populate('hospital', 'hospitalName')
    .populate('service', 'name');
    // .populate('speciality', 'name');

  return data;
};

const updateAppointmentById = async (appointmentId: string, appointment: any) => {
  const { customer, time, serviceId, hospitalId, message, source, status } = appointment;
  const { phoneNumber, name, email } = customer || {};
  let customerInfo;
  if (customer) {
    customerInfo = await CustomerCollection.findOneAndUpdate(
      { phoneNumber, name },
      { phoneNumber, name, email },
      { upsert: true, new: true }).exec();
  }
  let updatedInfo: any = {
    customer: get(customerInfo, '_id'),
    time,
    service: serviceId,
    hospital: hospitalId,
    message,
    source,
    status,
  };
  updatedInfo = omitBy(updatedInfo, isNil);
  const updatedAppointment = await AppointmentCollection.updateOne({ _id: appointmentId }, {
    $set: {
      ...updatedInfo
    }
  });
  const data = await getAppointmentById(appointmentId);
  return data;
}

const getAppointmentById = async (appointmentId: string, isRaw = false) => {
  if (isRaw) {
    return AppointmentCollection.findById(appointmentId).lean();
  }

  let appointment = await AppointmentCollection.findById(appointmentId)
  .populate('customer', ['name', 'phoneNumber'])
  .populate('hospital', 'hospitalName')
  .populate('speciality', 'name')
    .populate('service', 'name');

  return appointment;
}

const deleteAppointment = async (appointmentId: string) => {
  return AppointmentCollection.updateOne({ _id: appointmentId }, { deletedAt: new Date() })
}

export default {
  createAppointment,
  fetchAppointment,
  updateAppointmentById,
  getAppointmentById,
  deleteAppointment,
};
