/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose, { Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';
import addressUtil from '@app/utils/address.util';
import { forEach, map } from 'lodash';

const { Schema } = mongoose;

const CustomerAddressSchema = new Schema({
  title: {
    type: String
  },
  customerAccountId: { type: Schema.Types.ObjectId, ref: 'customer_account', index: true, },
  phoneNumber: String,
  email: String,
  isPrimary: Boolean,
  fullName: String,
  street: String,
  cityId: String,
  districtId: String,
  wardId: String,
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      return addressUtil.formatAddressV2(ret);
    }
  }
});

CustomerAddressSchema.plugin(mongoosePaginate);

const CustomerAddressCollection = mongoose.model('customer_address', CustomerAddressSchema, 'customer_address');

export default CustomerAddressCollection;
