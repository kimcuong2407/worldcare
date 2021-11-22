import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PRODUCT_POSITION_STATUS } from './constant';

const ProductPositionSchema = new mongoose.Schema(
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
      default: PRODUCT_POSITION_STATUS.ACTIVE,
    },
    branchId: {
      type: mongoose.Types.ObjectId,
      ref: 'branch'
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ProductPositionSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductPositionSchema.plugin(mongoosePaginate);

export const ProductPositionCollection = mongoose.model(
  'product_position',
  ProductPositionSchema
);

export default ProductPositionCollection;
