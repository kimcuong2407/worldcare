import { MEDICAL_SERVICE } from './../../core/constant/index';
import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const AppointmentSchema = new Schema({
  __v: { type: Number, select: false },
  time: Date,
  serviceType: {
    type: String,
    enum: Object.values(MEDICAL_SERVICE),
    default: MEDICAL_SERVICE.CLINIC_APPOINTMENT
  },
  speciality: { type: Schema.Types.ObjectId, ref: 'speciality' },
  hospital: { type: Schema.Types.ObjectId, ref: 'hospital' },
  branchId: { type: Number, ref: 'branch' },
  service: { type: Schema.Types.ObjectId, ref: 'service' },
  source: {
    type: String,
    default: 'WEBSITE'
  },
  customerNumber: { type: Number },
  message: String,
  status: {
    type: String,
    default: 'CREATED',
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

AppointmentSchema.plugin(mongoosePaginate);
AppointmentSchema.virtual('customerInfo', {
  ref: 'customer', // the collection/model name
  localField: 'customerNumber',
  foreignField: 'customer',
  match: (doc: any) => ({ branchId: doc.branchId }),
  justOne: true, // default is false
});

const AppointmentCollection = mongoose.model('appointment', AppointmentSchema, 'appointment');

export default AppointmentCollection;
