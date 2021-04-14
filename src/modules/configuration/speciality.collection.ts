/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;

const SpecialitySchema = new Schema({
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

SpecialitySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
SpecialitySchema.plugin(mongoosePaginate);
SpecialitySchema.plugin(autoIncrement.plugin, {
  model: 'speciality',
  field: 'incrementId',
  startAt: 1,
  incrementBy: 1
});


const SpecialityCollection = mongoose.model('speciality', SpecialitySchema, 'speciality');

export default SpecialityCollection;
