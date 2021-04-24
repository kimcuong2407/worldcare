import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
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
  const createdAppointment = await AppointmentCollection.create({
    customer: get(customerInfo, '_id'),
    time,
    service: serviceId,
    hospital: hospitalId,
    message,
  });
  const data = await AppointmentCollection.findOne({ _id: createdAppointment._id });
  return data;
}

const fetchAppointment = async (startTime, endTime) => {
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
  console.log(andQuery)
  const data = await AppointmentCollection.find({ $and: andQuery })
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
  let appointment = await AppointmentCollection.findById(appointmentId);

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
