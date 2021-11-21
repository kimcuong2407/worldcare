import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COUNTRY_STATUS } from './constant';

const CountrySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: COUNTRY_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
   },
  }
);

CountrySchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
CountrySchema.plugin(mongoosePaginate);

export const CountryCollection = mongoose.model(
  'country',
  CountrySchema
);

export default CountryCollection;
