import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const PolicySchema = new Schema({
  title: {
    type: String,
    intl: true,
  },
  content: {
    type: String,
    intl: true,
  },
  index: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

PolicySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
PolicySchema.plugin(mongoosePaginate);

const PolicyCollection = mongoose.model('policy', PolicySchema, 'policy');

export default PolicyCollection;
