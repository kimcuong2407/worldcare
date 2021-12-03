import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PRODUCT_GROUP_STATUS } from './constant';

const ProductGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  superGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_group',
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: PRODUCT_GROUP_STATUS.ACTIVE,
  },
  branchId: {
    type: Number,
    ref: 'branch'
  },
  deletedAt: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  }
});

ProductGroupSchema.virtual('superGroup', {
  ref: 'product_group',
  localField: 'superGroupId',
  foreignField: '_id',
  justOne: true
});

ProductGroupSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
ProductGroupSchema.plugin(mongoosePaginate);

export const ProductGroupCollection = mongoose.model('product_group', ProductGroupSchema);

export default ProductGroupCollection;
