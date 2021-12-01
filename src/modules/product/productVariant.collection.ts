import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const ProductVariantSchema = new mongoose.Schema({
  variantId: {
    type: String,
  },
  idSequence: Number,
  branchId: {
    type: mongoose.Types.ObjectId,
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
ProductVariantSchema.index({ variantId: 1, productId: 1});
ProductVariantSchema.plugin(mongoosePaginate);
ProductVariantSchema.plugin(mongooseAggregatePaginate);
ProductVariantSchema.plugin(AutoIncrement(mongoose), {
  id: 'variant_id_sequence',
  inc_field: 'idSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});

const ProductVariantCollection = mongoose.model(
  'product_variant',
  ProductVariantSchema,
  'product_variant',
);

export default ProductVariantCollection;