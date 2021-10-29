/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';
import addressUtil from '@app/utils/address.util';

const { Schema } = mongoose;

const CustomerSchema = new Schema({
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

CustomerSchema.plugin(mongoosePaginate);
CustomerSchema.index({ username: 1, phoneNumber: 1 }, { unique: true })

const CustomerAccountCollection = mongoose.model('customer_account', CustomerSchema, 'customer_account');

export default CustomerAccountCollection;
