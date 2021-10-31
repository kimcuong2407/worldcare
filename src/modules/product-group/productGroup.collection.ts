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
    ref: 'ProductGroup',
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: PRODUCT_GROUP_STATUS.ACTIVE,
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

ProductGroupSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
ProductGroupSchema.plugin(mongoosePaginate);

export const ProductGroupCollection = mongoose.model('product_group', ProductGroupSchema);

export default ProductGroupCollection;
