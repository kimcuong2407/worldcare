/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const SupplierSchema = new Schema({
  supplierCode: {
    type: String
  },
  name: {
    type: String
  },
  supplierCodeSequence: Number,
  phoneNumber: String,
  email: String,
  company: String,
  supplierGroupId: String,
  taxIdentificationNumber: String,
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  },
  note: String,
  currentDebt: Number,
  totalPurchase: Number,
  status: String,
  partnerId: Number,
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  __v: { type: Number, select: false }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

SupplierSchema.virtual('supplierGroup', {
  ref: 'supplier_group', // the collection/model name
  localField: 'supplierGroupId',
  foreignField: '_id',
  justOne: true, // default is false
});

SupplierSchema.index({ name: 'text', supplierCode: 'text'})
SupplierSchema.plugin(mongoosePaginate);
SupplierSchema.plugin(mongooseAggregatePaginate);
SupplierSchema.plugin(AutoIncrement(mongoose), {
  id: 'supplier_code_sequence',
  inc_field: 'supplierCodeSequence',
  start_seq: 1,
  disable_hooks: true,
  reference_fields: ['partnerId']
});

const SupplierCollection = mongoose.model('supplier', SupplierSchema, 'supplier');

export default SupplierCollection;
