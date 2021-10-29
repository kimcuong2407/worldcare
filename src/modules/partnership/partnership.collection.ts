import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const PartnershipSchema = new Schema({
  slug: String,
  name: String,
  address: String,
  email: String,
  phoneNumber: String,
  description: String,
  logo: String,
}, {
  timestamps: true,
});

PartnershipSchema.plugin(mongoosePaginate);

const PartnershipCollection = mongoose.model('partnership', PartnershipSchema, 'partnership');

export default PartnershipCollection;
