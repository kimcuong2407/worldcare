import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const HospitalSchema = new Schema({
  __v: { type: Number, select: false },
  name: {
    type: String,
    intl: true,
  },
  description: {
    type: String,
    intl: true,
  },
  hospitalname: String,
  email: {
    type: String,
    index: true
  },
  services: [{ type: Schema.Types.ObjectId, ref: 'service' }],
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
  },
  startTime: String,
  endTime: String,
  logo: String,
  services: Array,
  photos: [String],
  lastActivity: Date,
  slug: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

HospitalSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
HospitalSchema.plugin(mongoosePaginate);

const HospitalCollection = mongoose.model('hospital', HospitalSchema, 'hospital');

export default HospitalCollection;
