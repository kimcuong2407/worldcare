/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;

const DegreeSchema = new Schema({
  name: {
    type: String,
    intl: true
  },
  // incrementId: {
  //   type: Number,
  //   unique: true,
  // },
}, {
  timestamps: true,
   toJSON: {
        virtuals: true,
    }
});

DegreeSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
DegreeSchema.plugin(mongoosePaginate);
// DegreeSchema.plugin(autoIncrement.plugin, {
//   model: 'degree',
//   field: 'incrementId',
//   startAt: 100,
//   incrementBy: 1
// });


const DegreeCollection = mongoose.model('degree', DegreeSchema, 'degree');

export default DegreeCollection;
