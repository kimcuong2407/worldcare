/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const CustomerV2Schema = new Schema({
  code: String,
  codeSequence: Number,
  name: String,
  phoneNumber: String,
  birthday: Date,
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  },
  type: String,
  taxIdentificationNumber: String,
  email: String,
  facebook: String,
  group: String,
  note: String,
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

CustomerV2Schema.plugin(mongoosePaginate);
CustomerV2Schema.plugin(mongooseAggregatePaginate);
CustomerV2Schema.plugin(AutoIncrement(mongoose), {
  id: 'customer_code_sequence',
  inc_field: 'codeSequence',
  start_seq: 1,
  disable_hooks: true,
  reference_fields: ['partnerId']
});

const CustomerV2Collection = mongoose.model('customer_v2', CustomerV2Schema, 'customer_v2');

export default CustomerV2Collection;
