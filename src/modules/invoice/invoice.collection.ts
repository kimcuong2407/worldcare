import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const InvoiceDetail = new mongoose.Schema({
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batchId: {
    type: mongoose.Types.ObjectId,
    ref: 'batch'
  },
  saleOFF: Number,
  cost: Number,
  price: Number,
  quantity: Number
}, {
  timestamps: true
});

const InvoiceSchema = new mongoose.Schema({
  code: {
    type: String
  },
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  soldById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  saleChannel: {
    type: String,
  },
  invoiceDetail: [InvoiceDetail],
  paymentNote: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note'
  },
  status: String,
  deletedAt: Date,
},{
  timestamps: true,
});

InvoiceSchema.plugin(mongoosePaginate);

const InvoiceCollection = mongoose.model(
  'invoice',
  InvoiceSchema,
  'invoice'
);

export default InvoiceCollection;