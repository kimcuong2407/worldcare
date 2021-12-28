import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const PurchaseOrderItemBatchSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Types.ObjectId,
    ref: 'batch',
  },
  quantity: Number
}, {
  _id: false,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

PurchaseOrderItemBatchSchema.virtual('batch', {
  ref: 'batch', // the collection/model name
  localField: 'batchId',
  foreignField: '_id',
  justOne: true, // default is false
});

const PurchaseOrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
  },
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batches: [
    PurchaseOrderItemBatchSchema
  ],
  price: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  supplyPrice: Number,
  total: Number
}, {
  _id: false,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Phieu nhap kho
const PurchaseOrderSchema = new mongoose.Schema({
  code: String,
  purchaseOrderCodeSequence: Number,
  paymentNoteIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'payment_note',
      default: []
    }
  ],
  inventoryTransactions: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'inventory_transaction',
    }
  ],
  purchaseOrderItems: [PurchaseOrderItemSchema],
  totalQuantity: Number,
  totalProduct: Number,
  subTotal: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  totalPayment: Number,
  paid: Number,
  partnerId: Number,
  branchId: Number,
  status: String,
  supplierId: String,
  note: String,
  purchasedAt: Date,
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  involvedBy: String,
  currentDebt: String,
  createdBy: String,
  updatedBy: String,
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

PurchaseOrderItemSchema.virtual('product', {
  ref: 'product', // the collection/model name
  localField: 'productId',
  foreignField: '_id',
  justOne: true, // default is false
});
PurchaseOrderItemSchema.virtual('productVariant', {
  ref: 'product_variant', // the collection/model name
  localField: 'variantId',
  foreignField: '_id',
  justOne: true, // default is false
});

PurchaseOrderSchema.virtual('supplier', {
  ref: 'supplier', // the collection/model name
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true, // default is false
});

PurchaseOrderSchema.virtual('branch', {
  ref: 'branch', // the collection/model name
  localField: 'branchId',
  foreignField: '_id',
  justOne: true, // default is false
});

PurchaseOrderSchema.virtual('partner', {
  ref: 'partner', // the collection/model name
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true, // default is false
});
PurchaseOrderSchema.virtual('paymentNotes', {
  ref: 'payment_note', // the collection/model name
  localField: 'paymentNoteIds',
  foreignField: '_id'
});

PurchaseOrderSchema.plugin(mongoosePaginate);
PurchaseOrderSchema.plugin(AutoIncrement(mongoose), {
  id: 'purchase_order_sequence',
  inc_field: 'purchaseOrderCodeSequence',
  start_seq: 1,
  reference_fields: ['branchId']
});

const PurchaseOrderCollection = mongoose.model(
  'purchase_order',
  PurchaseOrderSchema,
  'purchase_order'
);

export default PurchaseOrderCollection;