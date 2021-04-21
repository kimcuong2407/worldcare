/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;

const employeeTypeSchema = new Schema({
  name: {
    type: String,
    intl: true
  },
  incrementId: {
    type: Number,
    unique: true,
  },
}, {
  timestamps: true,
  toJSON: {
      virtuals: true,
  }
});

employeeTypeSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
employeeTypeSchema.plugin(mongoosePaginate);
employeeTypeSchema.plugin(autoIncrement.plugin, {
  model: 'employee_type',
  field: 'incrementId',
  startAt: 1,
  incrementBy: 1
});


const EmployeeTypeCollection = mongoose.model('employee_type', employeeTypeSchema, 'employee_type');

export default EmployeeTypeCollection;
