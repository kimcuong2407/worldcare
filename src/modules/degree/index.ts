/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';

const { Schema } = mongoose;

const DegreeSchema = new Schema({
  name: {
    type: String
  },
  incrementId: {
    type: Number,
    unique: true,
  },
}, {
  timestamps: true,
});

DegreeSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
DegreeSchema.plugin(mongoosePaginate);

const DegreeCollection = mongoose.model('degree', DegreeSchema, 'degree');

export default DegreeCollection;
