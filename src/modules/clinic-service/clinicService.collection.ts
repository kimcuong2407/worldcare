/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const ClinicServiceSchema = new Schema({
  clinicServiceCode: {
    type: String
  },
  branchId: Number,
  serviceGroupId: String,
  name: {
    type: String,
    required: true
  },
  description: String,
  price: Number,
  priceUnit: String,
  status: String,
  clinicServiceCodeSequence: Number,
  // Audit fields
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  __v: { type: Number, select: false }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

ClinicServiceSchema.virtual('clinicServiceGroup', {
  ref: 'clinic_service_group', // the collection/model name
  localField: 'serviceGroupId',
  foreignField: '_id',
  justOne: true, // default is false
});

ClinicServiceSchema.plugin(mongoosePaginate);
ClinicServiceSchema.plugin(mongooseAggregatePaginate);
ClinicServiceSchema.plugin(AutoIncrement(mongoose), {
  id: 'clinic_service_code_sequence',
  inc_field: 'clinicServiceCodeSequence',
  reference_fields: ['partnerId', 'serviceGroupId'],
  start_seq: 1
});

const ClinicServiceCollection = mongoose.model('clinic_service', ClinicServiceSchema, 'clinic_service');

export default ClinicServiceCollection;
