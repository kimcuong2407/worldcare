/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;

const TitleSchema = new Schema({
  name: {
    type: String,
    intl: true
  },
  incrementId: {
    type: Number,
    unique: true,
  },
}, {
  timestamps: true,
  //  toJSON: {
  //       virtuals: true,
  //   }
});

TitleSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
TitleSchema.plugin(mongoosePaginate);
TitleSchema.plugin(autoIncrement.plugin, {
  model: 'title',
  field: 'incrementId',
  startAt: 1,
  incrementBy: 1
});


const TitleCollection = mongoose.model('title', TitleSchema, 'title');

export default TitleCollection;
