import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const SaleOrderDetail = new mongoose.Schema({
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
  _id: false,
  timestamps: true
});

const SaleOrderSchema = new mongoose.Schema({
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
    ref: 'user',
  },
  receiverById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  saleOrderDetail: [SaleOrderDetail],
  paymentNoteIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'payment_note'
    }
  ],
  invoiceIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'invoice',
      default: []
    }
  ],
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer_v2'
  },
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  purchasedAt: Date,
  involvedBy: String,
  saleChannel: String,
  status: String,
  note: String,
  customerNeedToPay: Number,
  customerPaid: Number,
  deletedAt: Date,
}, {
  timestamps: true,
})
SaleOrderDetail.virtual('product', {
  ref: 'product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});
SaleOrderDetail.virtual('productVariant', {
  ref: 'product_variant',
  localField: 'variantId',
  foreignField: '_id',
  justOne: true
});
SaleOrderDetail.virtual('batch', {
  ref: 'batch',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true
});
SaleOrderSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true
});
SaleOrderSchema.virtual('invoices', {
  ref: 'invoice',
  localField: 'invoiceIds',
  foreignField: '_id'
});
SaleOrderSchema.virtual('paymentNotes', {
  ref: 'payment_note',
  localField: 'paymentNoteIds',
  foreignField: '_id'
});
SaleOrderSchema.virtual('customer', {
  ref: 'customer_v2',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});
SaleOrderSchema.virtual('createdBy', {
  ref: 'user',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true
});


SaleOrderSchema.plugin(mongoosePaginate);
SaleOrderSchema.plugin(AutoIncrement(mongoose), {
  id: 'sale_order_code_sequence',
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});

const SaleOrderCollection = mongoose.model(
  'sale_order',
  SaleOrderSchema,
  'sale_order'
);

export default SaleOrderCollection;