import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import { VARIANT_CODE_SEQUENCE } from './constant';

const ProductVariantSchema = new mongoose.Schema({
  variantCode: {
    type: String,
  },
  codeSequence: Number,
  variantSearch: [String],
  branchId: {
    type: Number,
    ref: 'branch'
  },
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  isDefault: {
    type: Boolean,
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_unit',
    require: true,
  },
  exchangeValue: Number,
  barcode: String,
  cost: Number,
  price: Number,
  status: {
    type: String,
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true,
  }
});

ProductVariantSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true
});
ProductVariantSchema.virtual('product', {
  ref: 'product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});
ProductVariantSchema.virtual('productUnit', {
  ref: 'product_unit',
  localField: 'unitId',
  foreignField: '_id',
  justOne: true,
})

ProductVariantSchema.plugin(mongoosePaginate);
ProductVariantSchema.plugin(mongooseAggregatePaginate);
ProductVariantSchema.plugin(AutoIncrement(mongoose), {
  id: VARIANT_CODE_SEQUENCE,
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});
ProductVariantSchema.index({ variantCode: 'text', variantSearch: 'text'})

const ProductVariantCollection = mongoose.model(
  'product_variant',
  ProductVariantSchema,
  'product_variant',
);

export default ProductVariantCollection;