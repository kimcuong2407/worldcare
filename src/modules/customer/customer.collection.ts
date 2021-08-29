import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const CustomerSchema = new Schema({
  __v: { type: Number, select: false },
  name: String,
  phoneNumber: String,
  email: String,
  gender: String,
  source: String,
  dateOfBirth: Date,
  customerGroup: Number,
  idNumber: String,
  branchId: Number,
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

const CustomerCollection = mongoose.model('customer', CustomerSchema, 'customer');

export default CustomerCollection;
