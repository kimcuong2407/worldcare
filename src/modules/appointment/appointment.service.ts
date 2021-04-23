import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import AppointmentCollection from "./appointment.collection";

// DEGREE
const createAppointment = async (appointment: any) => {
  const createdAppointment = await AppointmentCollection.create(appointment);
  const data = await AppointmentCollection.findOne({_id: createdAppointment._id});
  return data;
}

const getAppointment = async (fields: string[]) => {
  const data = await AppointmentCollection.find({}, fields);
  return data;
};

const updateAppointmentById = async (appointmentId: string, appointment: any) => {
  const updatedAppointment = await AppointmentCollection.updateOne({_id: appointmentId}, {
    $set: {
      ...appointment
    }
  });
  const data = await AppointmentCollection.findOne({_id: appointmentId});
  return data;
}

const getAppointmentById = async (appointmentId: string) => {
  let appointment = await AppointmentCollection.findById(appointmentId);

  return appointment;
}

const deleteAppointment = async (appointmentId: string) => {
  return AppointmentCollection.deleteOne({_id: appointmentId})
}



export default {
  createAppointment,
  getAppointment,
  updateAppointmentById,
  getAppointmentById,
  deleteAppointment,
};
