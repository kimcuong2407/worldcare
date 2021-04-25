import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import zalo from "@app/core/zalo";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import moment from "moment";
import { Query, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import hospitalService from "../hospital/hospital.service";
import AppointmentCollection from "./appointment.collection";
import CustomerCollection from "./customer.collection";

// DEGREE
const createAppointment = async (appointment: any) => {
  const { customer, time, serviceId, hospitalId, message } = appointment;
  const { phoneNumber, name, email } = customer || {};
  const customerInfo = await CustomerCollection.findOneAndUpdate(
    { phoneNumber, name },
    { phoneNumber, name, email },
    { upsert: true }).exec();
  const hospital =  await hospitalService.fetchHospitalInfo(hospitalId);
  const createdAppointment = await AppointmentCollection.create({
    customer: get(customerInfo, '_id'),
    time,
    service: serviceId,
    hospital: hospitalId,
    message,
  });
  await zalo.sendZaloMessage(`Khách hàng ${name} vừa thực hiện đặt lịch tại ${get(hospital, 'hospitalName')} 
    vào lúc ${moment(time).format('DD/MM/YYYY hh:mm')}`);
  const data = await AppointmentCollection.findOne({ _id: createdAppointment._id });
  return data;
}

const fetchAppointment = async (startTime, endTime, serviceId, hospitalId) => {
  const query: any = {};
  const andQuery = [];
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

  if(hospitalId) {
    andQuery.push({
      hospital: hospitalId
    });
  }
  if(serviceId) {
    andQuery.push({
      service: serviceId
    });
  }
  if (andQuery && andQuery.length) {
    query['$and'] = andQuery;
  }
  const data = await AppointmentCollection.find(query)
    .populate('customer', 'name')
    .populate('hospital', 'hospitalName')
    .populate('service', 'name');

  return data;
};

const updateAppointmentById = async (appointmentId: string, appointment: any) => {
  const updatedAppointment = await AppointmentCollection.updateOne({ _id: appointmentId }, {
    $set: {
      ...appointment
    }
  });
  const data = await AppointmentCollection.findOne({ _id: appointmentId });
  return data;
}

const getAppointmentById = async (appointmentId: string) => {
  let appointment = await AppointmentCollection.findById(appointmentId)
  .populate('customer', 'name')
  .populate('hospital', 'hospitalName')
  .populate('service', 'name');

  return appointment;
}

const deleteAppointment = async (appointmentId: string) => {
  return AppointmentCollection.deleteOne({ _id: appointmentId })
}

export default {
  createAppointment,
  fetchAppointment,
  updateAppointmentById,
  getAppointmentById,
  deleteAppointment,
};
