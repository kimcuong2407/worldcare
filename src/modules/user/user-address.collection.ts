/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose, { Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';
import addressUtil from '@app/utils/address.util';
import { forEach, map } from 'lodash';

const { Schema } = mongoose;

const UserAddressSchema = new Schema({
  title: {
    type: String
  },
  userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, },
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

UserAddressSchema.plugin(mongoosePaginate);

const UserAddressCollection = mongoose.model('user_address', UserAddressSchema, 'user_address');

export default UserAddressCollection;
