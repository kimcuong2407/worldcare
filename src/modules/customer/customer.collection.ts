import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const CustomerSchema = new Schema({
  fullName: String,
  phoneNumber: String,
  email: String,
  gender: String,
  source: String,
  dateOfBirth: Date,
  customerGroup: Number,
  customerNumber: Number,
  branchId: Number,
  userId: String,
  partnerId: Number,
  note: String,
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  }
}, {
  timestamps: true,
});

CustomerSchema.plugin(mongoosePaginate);


CustomerSchema.plugin(AutoIncrement(mongoose), {
  id: 'customer_number_by_company',
  inc_field: 'customerNumber',
  reference_fields: ['partnerId'],
});

const CustomerCollection = mongoose.model('customer', CustomerSchema, 'customer');

export default CustomerCollection;
