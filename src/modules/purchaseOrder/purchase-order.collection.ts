import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const PurchaseOrderDetail = new mongoose.Schema({
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batchId: {
    type: mongoose.Types.ObjectId,
    ref: 'batch',
  },
  saleOFF: Number,
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
  idSequence: Number,
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  supplierCode: String,

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
  status: String,
  deletedAt: Date,
}, {
  timestamps: true,
})


PurchaseOrderSchema.plugin(mongoosePaginate);
PurchaseOrderSchema.plugin(AutoIncrement(mongoose), {
  id: 'purchase_order_id_sequence',
  inc_field: 'idSequence',
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