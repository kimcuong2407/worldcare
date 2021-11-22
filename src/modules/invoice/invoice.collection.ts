import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const InvoiceDetail = new mongoose.Schema({
  branchId: {
    type: mongoose.Types.ObjectId,
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
  idSequence: Number,
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
InvoiceSchema.plugin(AutoIncrement(mongoose), {
  id: 'invoice_id_sequence',
  inc_field: 'idSequence',
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