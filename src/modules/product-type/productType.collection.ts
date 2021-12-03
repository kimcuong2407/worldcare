import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PRODUCT_TYPE_STATUS } from './constant';

const ProductTypeSchema = new mongoose.Schema(
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
      default: PRODUCT_TYPE_STATUS.ACTIVE,
    },
    branchId: {
      type: Number,
      ref: 'branch'
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

ProductTypeSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductTypeSchema.plugin(mongoosePaginate);

export const ProductTypeCollection = mongoose.model(
  'product_type',
  ProductTypeSchema
);

export default ProductTypeCollection;
