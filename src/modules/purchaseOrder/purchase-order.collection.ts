import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const PurchaseOrderDetail = new mongoose.Schema({
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
    ref: 'batch',
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
  quantity: Number,
}, {
  timestamps: true
});

const PurchaseOrderSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  codeSequence: Number,
  branchId: {
    type: Number,
    ref: 'branch'
  },
  supplierId: String,
  createdById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  receiverById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  }, 
  purchaseOrderDetail: [PurchaseOrderDetail],
  paymentNoteId: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note'
  },
  invoiceId: {
    type: mongoose.Types.ObjectId,
    ref: 'invoice'
  },
  saleChannel: String,
  status: String,
  note: String,
  deletedAt: Date,
}, {
  timestamps: true,
})


PurchaseOrderSchema.plugin(mongoosePaginate);
PurchaseOrderSchema.plugin(AutoIncrement(mongoose), {
  id: 'purchase_order_code_sequence',
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});

const PurchaseOrderCollection = mongoose.model(
  'purchase_order',
  PurchaseOrderSchema,
  'purchase_order'
);

export default PurchaseOrderCollection;