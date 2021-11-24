import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { MANUFACTURER_STATUS } from './constant';

const ManufacturerSchema = new mongoose.Schema(
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
      default: MANUFACTURER_STATUS.ACTIVE,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ManufacturerSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ManufacturerSchema.plugin(mongoosePaginate);

export const ManufacturerCollection = mongoose.model(
  'manufacturer',
  ManufacturerSchema
);

export default ManufacturerCollection;
