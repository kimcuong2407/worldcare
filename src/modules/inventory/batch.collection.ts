import { trimEnd } from 'lodash';
import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    unique: true,
    required: true,
  },
  aliasName: {
    type: String,
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

const BatchCollection = mongoose.model(
  'batch',
  BatchSchema,
  'batch',
);

export default BatchCollection;