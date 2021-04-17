import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const ServiceSchema = new Schema({
  __v: { type: Number, select: false },
  title: {
    type: String,
    intl: true,
  },
  description: {
    type: String,
    intl: true,
  },
  content: {
    type: String,
    intl: true,
  },
  cover: String,
  meta: {
    title: {
      type: String,
      intl: true,
    },
    description: {
      type: String,
      intl: true,
    },
    keywords: {
      type: String,
      intl: true,
    },
  },
  parentService: [{ type: Schema.Types.ObjectId, ref: 'service' }],
  slug: {
    type: String,
    unique: true,
  },
  faq: [{
    question: String,
    answer: String,
  }]
}, {
  timestamps: true,
});

ServiceSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
ServiceSchema.plugin(mongoosePaginate);

const ServiceCollection = mongoose.model('service', ServiceSchema, 'service');

export default ServiceCollection;
