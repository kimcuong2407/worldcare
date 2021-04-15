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
  startTime: String,
  endTime: String,
  logo: String,
  services: Array,
  photos: [String],
  lastActivity: Date,
}, {
  timestamps: true,
});

HospitalSchema.plugin(mongoosePaginate);
HospitalSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
HospitalSchema.plugin(mongoosePaginate);

const HospitalCollection = mongoose.model('hospital', HospitalSchema, 'hospital');

export default HospitalCollection;
