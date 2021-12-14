import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PRODUCT_UNIT_STATUS } from './constant';

const ProductUnitSchema = new mongoose.Schema(
  {
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
      default: PRODUCT_UNIT_STATUS.ACTIVE,
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

ProductUnitSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductUnitSchema.plugin(mongoosePaginate);

export const ProductUnitCollection = mongoose.model(
  'product_unit',
  ProductUnitSchema
);

export default ProductUnitCollection