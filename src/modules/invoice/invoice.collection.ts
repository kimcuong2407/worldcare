import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const InvoiceDetail = new mongoose.Schema({
  branchId: {
    type: Number,
    ref: 'branch'
  },
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batchId: {
    type: mongoose.Types.ObjectId,
    ref: 'batch'
  },
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product'
  },
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  cost: Number,
  price: Number,
  quantity: Number
});

const InvoiceSchema = new mongoose.Schema({
  code: {
    type: String
  },
  codeSequence: Number,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  branchId: {
    type: Number,
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
  paymentNoteId: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note'
  },
  status: String,
  purchaseOrderId: {
    type: mongoose.Types.ObjectId,
    ref: 'purchase_order'
  },
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  deletedAt: Date
}, {
  timestamps: true,
});

InvoiceSchema.plugin(mongoosePaginate);
InvoiceSchema.plugin(AutoIncrement(mongoose), {
  id: 'invoice_code_sequence',
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true,
})

const InvoiceCollection = mongoose.model(
  'invoice',
  InvoiceSchema,
  'invoice'
);

export default InvoiceCollection;