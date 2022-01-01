import { concat } from 'lodash';
import moment from 'moment';
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
  manufacturingDate: Date,
  expirationDate: Date,
  status: String,
  quantity: Number,
  deletedAt: Date,
  batchSearch: [String],
}, {
  timestamps: true,
});

BatchSchema.post('save', (doc: any, next) => {
  doc.batchSearch = concat(doc.lotNumber, doc.aliasName, moment(doc.expirationDate).format('DD/MM/YYYY'));
  doc.save();
  next();
});
BatchSchema.plugin(mongoosePaginate);
BatchSchema.index({ lotNumber: 'text', batchSearch: 'text' });

const BatchCollection = mongoose.model(
  'batch',
  BatchSchema,
  'batch',
);

export default BatchCollection;