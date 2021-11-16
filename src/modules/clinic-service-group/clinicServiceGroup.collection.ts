/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const { Schema } = mongoose;

const ClinicServiceGroupSchema = new Schema({
  serviceGroupCode: {
    type: String
  },
  name: String,
  description: String,
  status: String,
  branchId: Number,
  clinicServiceGroupCodeSequence: Number,
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  __v: { type: Number, select: false }
}, {
  timestamps: true
});

ClinicServiceGroupSchema.plugin(mongoosePaginate);
ClinicServiceGroupSchema.plugin(mongooseAggregatePaginate);
ClinicServiceGroupSchema.plugin(AutoIncrement(mongoose), {
  id: 'clinic_service_group_code_sequence',
  inc_field: 'clinicServiceGroupCodeSequence',
  reference_fields: ['branchId'],
  start_seq: 1
});

const ClinicServiceGroupCollection = mongoose.model('clinic_service_group', ClinicServiceGroupSchema, 'clinic_service_group');

export default ClinicServiceGroupCollection;
