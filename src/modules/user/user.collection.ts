/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';
import addressUtil from '@app/utils/address.util';

const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: {
    type: String
  },
  firstName: String,
  lastName: String,
  gender: String,
  phoneNumber: {
    type: String,
    index: true
  },
  branchId: Number,
  partnerId: Number,
  employeeNumber: Number,
  username: String,
  email: {
    type: String,
    index: true
  },
  groups: [{ type: Schema.Types.ObjectId, ref: 'role' }],
  password: String,
  address: Object,
  idNumber: String,
  bloodType: String,
  avatar: String,
  dob: Date,
  note: String,
  deletedAt: Date,
  createdBy: String,
  updatedBy: String,
  isActive: Boolean,
  isCustomer: {
    type: Boolean,
    default: true,
  },
  lastActivity: Date,
  lastLoggedIn: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      const { address } = ret;
      return {
        ...ret,
        address: addressUtil.formatAddressV2(address)
      };
    }
  }
});

UserSchema.plugin(mongoosePaginate);
UserSchema.index({ username: 1, partnerId: 1 }, { unique: true })

const UserCollection = mongoose.model('user', UserSchema, 'user');

export default UserCollection;
