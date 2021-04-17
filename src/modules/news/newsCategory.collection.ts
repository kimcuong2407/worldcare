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
  slug: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

NewsCategorySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
NewsCategorySchema.plugin(mongoosePaginate);

const NewsCategoryCollection = mongoose.model('NewsCategory', NewsCategorySchema, 'news_category');

export default NewsCategoryCollection;
