import { MEDICAL_SERVICE } from './../../core/constant/index';
import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const ContactSchema = new Schema({
  name: String,
  address: String,
  phoneNumber: String,
  email: String,
  message: String,
}, {
  timestamps: true,
});

ContactSchema.plugin(mongoosePaginate);

const ContactCollection = mongoose.model('contact', ContactSchema, 'contact');

export default ContactCollection;
