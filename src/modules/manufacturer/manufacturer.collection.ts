import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';

const ManufacturerSchem = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ManufacturerSchem.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ManufacturerSchem.plugin(mongoosePaginate);

export const ManufacturerCollection = mongoose.model(
  'manufacturer',
  ManufacturerSchem
);

export default ManufacturerCollection;
