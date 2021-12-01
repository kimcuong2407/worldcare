import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const BatchSchema = new mongoose.Schema({
  branchId: {
    type: Number,
    ref: 'branch'
  },
  lotNumber: {
    type: String,
    required: true,
  },
  aliasName: {
    type: String,
  },
  productId: {
    type: String,
    ref: 'product',
    required: true,
  },
  variantId: {
    type: String,
    ref: 'product_variant',
    required: true,
  },
  expirationDate: Date,
  status: String,
  quantity: Number,
}, {
  timestamps: true,
});

BatchSchema.plugin(mongoosePaginate);

const BatchCollection = mongoose.model(
  'batch',
  BatchSchema,
  'batch',
);

export default BatchCollection;