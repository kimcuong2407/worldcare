import mongoose from 'mongoose';

export interface StaffModel extends mongoose.Document {
  firstName: string;
  lastName: string;
  fullName: string;
  description: string;
  gender: boolean;
  phoneNumber: string;
  email: string;
  hospital: string;
  title: [string];
  degree: [string];
  speciality: [string];
  employeeGroup: string;
  avatar: string;
  createdBy: string;
  updatedBy: string;
}

export default {};
