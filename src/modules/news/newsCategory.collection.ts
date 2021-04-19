import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const NewsCategorySchema = new Schema({
  __v: { type: Number, select: false },
  name: {
    type: String,
    intl: true,
  },
  description: {
    type: String,
    intl: true,
  },
  metaTitle: {
    type: String,
    intl: true,
  },
  metaDescription: {
    type: String,
    intl: true,
  },
  metaKeywords: {
    type: String,
    intl: true,
  },
  slug: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

NewsCategorySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
NewsCategorySchema.plugin(mongoosePaginate);

const NewsCategoryCollection = mongoose.model('news_category', NewsCategorySchema, 'news_category');

export default NewsCategoryCollection;
