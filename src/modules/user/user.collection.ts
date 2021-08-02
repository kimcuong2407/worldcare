/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const UserSchema = new Schema({
  __v: { type: Number, select: false },

  name: {
    type: String
  },
  gender: Boolean,
  phoneNumber: String,
  username: String,
  email: {
    type: String,
    index: true
  },
  password: String,
  address: String,
  avatar: String,
  dob: String,
  createdBy: String,
  updatedBy: String,
  lastActivity: Date,
  lastLoggedIn: Date,
}, {
  timestamps: true,
});

UserSchema.plugin(mongoosePaginate);

const UserCollection = mongoose.model('user', UserSchema, 'user');

export default UserCollection;
