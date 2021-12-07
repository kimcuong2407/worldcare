/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const PrescriptionV2Schema = new Schema({
  code: String,
  prescriptionCodeSequence: Number,
  doctor: String,
  healthcareFacility: String,
  patientName: String,
  patientId: String,
  patientHealthInsuranceCardNumber: String,
  age: Number,
  gender: String,
  weight: String,
  address: String,
  phoneNumber: String,
  diagnosis: String,
  branchId: Number,
  diseaseName: String,
  diseaseCode: String,
  activeIngredient: String,
  dose: String,
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

PrescriptionV2Schema.plugin(mongoosePaginate);
PrescriptionV2Schema.plugin(mongooseAggregatePaginate);
PrescriptionV2Schema.plugin(AutoIncrement(mongoose), {
  id: 'prescription_code_sequence',
  inc_field: 'prescriptionCodeSequence',
  start_seq: 1,
  disable_hooks: true,
  reference_fields: ['branchId']
});

const PrescriptionV2Collection = mongoose.model('prescription_v2', PrescriptionV2Schema, 'prescription_v2');

export default PrescriptionV2Collection;
