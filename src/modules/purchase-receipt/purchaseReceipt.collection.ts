import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const PurchaseReceiptItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
  },
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant',
  },
  batches: [
    {
      batchId: {
        type: mongoose.Types.ObjectId,
        ref: 'batch',
      },
      quantity: Number
    }
  ],
  price: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  supplyPrice: Number,
  total: Number
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Phieu nhap kho
const PurchaseReceiptSchema = new mongoose.Schema({
  code: String,
  purchaseReceiptCodeSequence: Number,
  paymentNoteIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'payment_note',
    }
  ],
  inventoryTransactions: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'inventory_transaction',
    }
  ],
  purchaseReceiptItems: [PurchaseReceiptItemSchema],
  totalQuantity: Number,
  totalProduct: Number,
  subTotal: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  total: Number,
  paid: Number,
  partnerId: String,
  branchId: String,
  status: String,
  supplierId: String,
  note: String,
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createdBy: String,
  updatedBy: String,
  deletedAt: String
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

PurchaseReceiptItemSchema.virtual('product', {
  ref: 'product', // the collection/model name
  localField: 'productId',
  foreignField: '_id',
  justOne: true, // default is false
});
PurchaseReceiptItemSchema.virtual('productVariant', {
  ref: 'product_variant', // the collection/model name
  localField: 'variantId',
  foreignField: '_id',
  justOne: true, // default is false
});

PurchaseReceiptSchema.virtual('supplier', {
  ref: 'supplier', // the collection/model name
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true, // default is false
});

PurchaseReceiptSchema.plugin(mongoosePaginate);
PurchaseReceiptSchema.plugin(AutoIncrement(mongoose), {
  id: 'purchase_receipt_sequence',
  inc_field: 'purchaseReceiptCodeSequence',
  start_seq: 1,
  reference_fields: ['branchId']
});

const PurchaseReceiptCollection = mongoose.model(
  'purchase_receipt',
  PurchaseReceiptSchema,
  'purchase_receipt'
);

export default PurchaseReceiptCollection;