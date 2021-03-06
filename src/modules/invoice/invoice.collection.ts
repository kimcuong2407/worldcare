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
  branch: Object,
  variant: Object,
  batch: Object,
  product: Object,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  cost: Number,
  price: Number,
  quantity: Number
}, {
  _id: false
});

const InvoiceSchema = new mongoose.Schema({
  code: {
    type: String
  },
  codeSequence: Number,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer_v2',
  },
  branchId: {
    type: Number,
    ref: 'branch'
  },
  soldById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createdById: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  saleChannel: {
    type: String,
  },
  invoiceDetail: [InvoiceDetail],
  paymentNoteIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'payment_note'
    }
  ],
  status: String,
  saleOrderId: {
    type: mongoose.Types.ObjectId,
    ref: 'sale_order'
  },
  prescriptionId: {
    type: mongoose.Types.ObjectId,
    ref: 'prescription_v2'
  },
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  total: Number,
  totalPayment: Number,
  purchasedAt: Date,
  involvedBy: String,
  deletedAt: Date
}, {
  timestamps: true,
});

InvoiceSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true
});

InvoiceSchema.virtual('customer', {
  ref: 'customer_v2',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});
InvoiceSchema.virtual('paymentNotes', {
  ref: 'payment_note',
  localField: 'paymentNoteIds',
  foreignField: '_id'
});
InvoiceSchema.virtual('createdBy', {
  ref: 'user',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true
});
InvoiceSchema.virtual('saleOrder', {
  ref: 'sale_order',
  localField: 'saleOrderId',
  foreignField: '_id',
  justOne: true
});
InvoiceSchema.virtual('prescription', {
  ref: 'prescription_v2',
  localField: 'prescriptionId',
  foreignField: '_id',
  justOne: true
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