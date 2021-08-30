/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

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
  employeeNumber: Number,
  username: String,
  email: {
    type: String,
    index: true
  },
  groups: [{ type: Schema.Types.ObjectId, ref: 'role' }],
  password: String,
  address: Object,
  avatar: String,
  dob: String,
  note: String,
  deletedAt: Date,
  createdBy: String,
  updatedBy: String,
  lastActivity: Date,
  lastLoggedIn: Date,
}, {
  timestamps: true,
});

UserSchema.plugin(mongoosePaginate);
UserSchema.index({ username: 1, branchId: 1 }, { unique: true })

const UserCollection = mongoose.model('user', UserSchema, 'user');

export default UserCollection;
