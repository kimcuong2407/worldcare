/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import addressUtil from '@app/utils/address.util';

const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  fullName: String,
  companyId: Number,
  employeeNumber: Number,
  description: {
    type: String,
  },
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  },
  gender: String,
  phoneNumber: String,
  email: {
    type: String,
    index: true
  },
  title: [{ type: Schema.Types.ObjectId, ref: 'title' }],
  degree: { degreeId: {type: Schema.Types.ObjectId, ref: 'degree'}, issuedAt: Date },
  speciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
  employeeGroup: { type: Schema.Types.ObjectId, ref: 'employee_group' },
  avatar: String,
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
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
    transform: (doc, ret) => {
      const {address, ...rest} = ret;
      return {
        ...ret,
        address: addressUtil.formatAddressV2(ret),
      };
    },
  }
});

EmployeeSchema.plugin(AutoIncrement(mongoose), {
  id: 'employee_number_by_company',
  inc_field: 'employeeNumber',
  reference_fields: ['companyId'],
  // startAt: 10005,
  // incrementBy: 1
});

EmployeeSchema.plugin(mongoosePaginate);
EmployeeSchema.plugin(mongooseAggregatePaginate);

const EmployeeCollection = mongoose.model('employee', EmployeeSchema, 'employee');

export default EmployeeCollection;
