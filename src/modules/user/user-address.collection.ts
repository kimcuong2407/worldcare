/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose, { Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const UserAddressSchema = new Schema({
  title: {
    type: String
  },
  userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, },
  phoneNumber: String,
  isPrimary: Boolean,
  fullName: String,
  street: String,
  cityId: String,
  districtId: String,
  wardId: String,
}, {
  timestamps: true,
});

UserAddressSchema.plugin(mongoosePaginate);

const UserAddressCollection = mongoose.model('user_address', UserAddressSchema, 'user_address');

export default UserAddressCollection;
