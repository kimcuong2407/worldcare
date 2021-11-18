import mongoose from 'mongoose';

const LotSchema = new mongoose.Schema({
  lotNumber: {
    type: String,
    unique: true,
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
  productVariantId: {
    type: String,
    ref: 'product_variant',
    required: true,
  },
  expirationDate: Date,
  status: String,
  quanity: Number,
});

const LotCollection = mongoose.model(
  'lot',
  LotSchema,
  'lot',
);

export default LotCollection;