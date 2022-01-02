import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import {PURCHASE_RETURN_STATUS, PurchaseReturnConstants} from '@modules/purchase-return/constant';

const PurchaseReturnItemBatchSchema = new mongoose.Schema({
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

PurchaseReturnItemBatchSchema.virtual('batch', {
  ref: 'batch',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true,
});

const PurchaseReturnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
  },
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batches: [
    PurchaseReturnItemBatchSchema
  ],
  buyPrice: Number,
  returnPrice: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  finalPrice: Number
}, {
  _id: false,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

const PurchaseReturnSchema = new mongoose.Schema({
  code: String,
  codeSequence: Number,
  paymentNoteIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'payment_note',
      default: []
    }
  ],
  inventoryTransactionIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'inventory_transaction',
      default: []
    }
  ],
  purchaseReturnItems: [PurchaseReturnItemSchema],
  totalQuantity: Number,
  totalProduct: Number,
  subTotal: Number,

  discountValue: Number,
  discountPercent: Number,
  discountType: String,

  totalSupplierPayment: Number,
  totalSupplierPaid: Number,
  supplierDebt: Number,

  partnerId: Number,
  branchId: Number,
  status: {
    type: String,
    enum: Object.values(PURCHASE_RETURN_STATUS)
  },
  supplierId: String,
  note: String,
  purchasedAt: Date,
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  involvedBy: String,
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  updatedBy: String,
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

PurchaseReturnSchema.virtual('product', {
  ref: 'product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});
PurchaseReturnSchema.virtual('productVariant', {
  ref: 'product_variant',
  localField: 'variantId',
  foreignField: '_id',
  justOne: true,
});

PurchaseReturnSchema.virtual('supplier', {
  ref: 'supplier',
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true,
});

PurchaseReturnSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true,
});

PurchaseReturnSchema.virtual('partner', {
  ref: 'partner',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true,
});
PurchaseReturnSchema.virtual('paymentNotes', {
  ref: 'payment_note',
  localField: 'paymentNoteIds',
  foreignField: '_id'
});
PurchaseReturnSchema.virtual('inventoryTransactions', {
  ref: 'inventory_transaction',
  localField: 'inventoryTransactionIds',
  foreignField: '_id'
});

PurchaseReturnSchema.plugin(mongoosePaginate);
PurchaseReturnSchema.plugin(AutoIncrement(mongoose), {
  id: PurchaseReturnConstants.CODE_SEQUENCE_NAME,
  inc_field: 'codeSequence',
  start_seq: 1,
  reference_fields: ['branchId']
});

const PurchaseReturnCollection = mongoose.model(
  'purchase_return',
  PurchaseReturnSchema,
  'purchase_return'
);

export default PurchaseReturnCollection;