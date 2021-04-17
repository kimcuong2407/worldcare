import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const AppointmentSchema = new Schema({
  __v: { type: Number, select: false },
  time: Date,
  hospital: [{ type: Schema.Types.ObjectId, ref: 'hospital' }],
  services: Array,
  message: String,
  customer: [{ type: Schema.Types.ObjectId, ref: 'customer' }],
}, {
  timestamps: true,
});

AppointmentSchema.plugin(mongoosePaginate);

const AppointmentCollection = mongoose.model('appointment', AppointmentSchema, 'appointment');

export default AppointmentCollection;
