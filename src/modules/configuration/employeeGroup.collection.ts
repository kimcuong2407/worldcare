/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';

const { Schema } = mongoose;

const employeeGroupSchema = new Schema({
  name: {
    type: String,
    intl: true
  },
  key: {
    type: String,
    unique: true,
  },
  // incrementId: {
  //   type: Number,
  //   unique: true,
  // },
}, {
  timestamps: true,
  toJSON: {
      virtuals: true,
  }
});

employeeGroupSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
employeeGroupSchema.plugin(mongoosePaginate);
// employeeGroupSchema.plugin(autoIncrement.plugin, {
//   model: 'employee_group',
//   field: 'incrementId',
//   startAt: 100,
//   incrementBy: 1
// });


const EmployeeGroupCollection = mongoose.model('employee_group', employeeGroupSchema, 'employee_group');

export default EmployeeGroupCollection;
