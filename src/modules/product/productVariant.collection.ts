import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const ProductVariantSchema = new mongoose.Schema({
  variantId: {
    type: String,
  },
  idSequence: Number,
  productId: {
    type: String,
    ref: 'product',
    required: true,
  },
  isDefault: {
    type: Boolean,
  },
  unit: {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product-unit',
      require: true,
    },
    exchangeValue: Number,
    barcode: String,
  },
  pricing: {
    cost: Number,
    price: Number,
  },
  status: {
    type: String,
  }
});

ProductVariantSchema.plugin(mongoosePaginate);
ProductVariantSchema.plugin(mongooseAggregatePaginate);
ProductVariantSchema.plugin(AutoIncrement(mongoose), {
  id: 'variant_id_sequence',
  inc_field: 'idSequence',
  start_seq: 1,
});

const ProductVariantCollection = mongoose.model(
  'product_variant',
  ProductVariantSchema,
  'product_variant',
);

export default ProductVariantCollection;