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
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
  },
  gender: String,
  phoneNumber: String,
  email: {
    type: String,
    index: true
  },
  hospital: { type: Schema.Types.ObjectId, ref: 'hospital' },
  title: [{ type: Schema.Types.ObjectId, ref: 'title' }],
  degree: { degreeId: {type: Schema.Types.ObjectId, ref: 'degree'}, issuedAt: Date },
  speciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
  employeeGroup: { type: Schema.Types.ObjectId, ref: 'employee_group' },
  avatar: String,
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    unique: true,
  },
  deletedAt: Date,
  lang: [String],
  certification: [
    {
      name: String,
      certifiedBy: String,
      certifiedAt: Date,
    }
  ],
  employeeHistory: [
    {
      location: String,
      role: String,
      startTime: Date,
      endTime: Date
    }
  ]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

StaffSchema.plugin(mongoosePaginate);
StaffSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });

const StaffCollection = mongoose.model('staff', StaffSchema, 'staff');

export default StaffCollection;
