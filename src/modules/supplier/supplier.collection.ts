/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const { Schema } = mongoose;

const SupplierSchema = new Schema({
  supplierCode: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    unique: true
  },
  phoneNumber: String,
  email: String,
  company: String,
  supplierGroup: String,
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
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
}, {
  timestamps: true
});

SupplierSchema.plugin(mongoosePaginate);
SupplierSchema.plugin(mongooseAggregatePaginate);
SupplierSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'supplierCodeSequence',
  id: 'supplier_id_sequence',
  start_seq: 1,
});

const SupplierCollection = mongoose.model('supplier', SupplierSchema, 'supplier');

export default SupplierCollection;
