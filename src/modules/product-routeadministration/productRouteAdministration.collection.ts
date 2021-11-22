import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PRODUCT_ROUTE_ADMINISTRATION_STATUS } from './constant';

const ProductRouteAdministrationSchema = new mongoose.Schema(
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
      default: PRODUCT_ROUTE_ADMINISTRATION_STATUS.ACTIVE,
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

ProductRouteAdministrationSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductRouteAdministrationSchema.plugin(mongoosePaginate);

export const ProductRouteAdministrationCollection = mongoose.model(
  'product_route_administration',
  ProductRouteAdministrationSchema
);

export default ProductRouteAdministrationCollection;
