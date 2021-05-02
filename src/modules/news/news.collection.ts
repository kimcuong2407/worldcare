import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const NewsSchema = new Schema({
  __v: { type: Number, select: false },
  title: {
    type: String,
    intl: true,
  },
  index: Number,
  description: {
    type: String,
    intl: true,
  },
  content: {
    type: String,
    intl: true,
  },
  tags: [String],
  category: [{ type: Schema.Types.ObjectId, ref: 'news_category' }],
  coverPhoto: String,
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
  author: {
     type: Schema.Types.ObjectId, ref: 'user'
  },
  status: {
    type: String,
  },
  isFeatured: {
    type: Boolean,
  },
  slug: {
    type: String,
    unique: true,
  },
  deletedAt: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

NewsSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
NewsSchema.plugin(mongoosePaginate);

const NewsCollection = mongoose.model('News', NewsSchema, 'news');

export default NewsCollection;
