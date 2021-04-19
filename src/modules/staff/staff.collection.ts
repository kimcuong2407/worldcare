/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';

const { Schema } = mongoose;

const StaffSchema = new Schema({
  __v: { type: Number, select: false },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  fullName: String,
  description: {
    type: String,
    intl: true
  },
  gender: Boolean,
  phoneNumber: String,
  email: {
    type: String,
    index: true
  },
  hospital: { type: Schema.Types.ObjectId, ref: 'hospital' },
  title: [{ type: Schema.Types.ObjectId, ref: 'title' }],
  degree: [{ type: Schema.Types.ObjectId, ref: 'degree' }],
  speciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
  employeeType: { type: Schema.Types.ObjectId, ref: 'employeetype' },
  avatar: String,
  createdBy: String,
  updatedBy: String,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

StaffSchema.plugin(mongoosePaginate);
StaffSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });

const UserCollection = mongoose.model('staff', StaffSchema, 'staff');

export default UserCollection;
