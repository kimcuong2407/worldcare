import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseIntl from 'mongoose-intl';

const { Schema } = mongoose;

const SpecialitySchema = new Schema({
  name: {
    type: String,
    intl: true
  },
  icon: String,
  service: String,
  description: {
    type: String,
    intl: true
  },
  parentSpeciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
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

SpecialitySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
SpecialitySchema.plugin(mongoosePaginate);
// SpecialitySchema.plugin(autoIncrement.plugin, {
//   model: 'speciality',
//   field: 'incrementId',
//   startAt: 100,
//   incrementBy: 1
// });


const SpecialityCollection = mongoose.model('speciality', SpecialitySchema, 'speciality');

export default SpecialityCollection;
