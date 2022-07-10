import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import { PRODUCT_RETURN_STATUS } from './constant';

const ProductReturnDetail = new mongoose.Schema({
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
  cost: Number,
  price: Number,
  quantity: Number,
}, {
  _id: false,
  timestamps: true
})

const ProductReturnSchema = new mongoose.Schema({
  code: {
    type: String
  },
  codeSequence: Number,
  invoiceId: {
    type: mongoose.Types.ObjectId,
    ref: 'invoice'
  },
  exchangeInvoiceId: {
    type: mongoose.Types.ObjectId,
    ref: 'invoice'
  },
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer_v2'
  },
  paymentNoteId: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note'
  },
  receivedById: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  createdById: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  inventoryTransactionIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'inventory_transaction',
      default: []
    }
  ],
  productReturnDetail: [ProductReturnDetail],
  partnerId: Number,
  branchId: Number,
  saleChannel: String,
  fee: Number,
  discountValue: Number,
  discountPercent: Number,
  discountType: String,
  status: String,
  note: String,


}, {
  timestamps: true
})
ProductReturnDetail.virtual('product', {
  ref: 'product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});
ProductReturnDetail.virtual('productVariant', {
  ref: 'product_variant',
  localField: 'variantId',
  foreignField: '_id',
  justOne: true
});
ProductReturnDetail.virtual('batch', {
  ref: 'batch',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true
});
ProductReturnSchema.virtual('invoices', {
  ref: 'invoice',
  localField: 'invoiceId',
  foreignField: '_id'
});
ProductReturnSchema.virtual('invoices', {
  ref: 'invoice',
  localField: 'exchangeInvoiceId',
  foreignField: '_id'
});
ProductReturnSchema.virtual('paymentNote', {
  ref: 'payment_note',
  localField: 'paymentNoteId',
  foreignField: '_id'
});
ProductReturnSchema.virtual('customer', {
  ref: 'customer_v2',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});
ProductReturnSchema.virtual('receivedBy', {
  ref: 'employee',
  localField: 'receivedById',
  foreignField: '_id',
  justOne: true
});

ProductReturnSchema.plugin(mongoosePaginate);
ProductReturnSchema.plugin(AutoIncrement(mongoose), {
  id: 'product_return_code_sequence',
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});

ProductReturnSchema.virtual('inventoryTransactions', {
  ref: 'inventory_transaction',
  localField: 'inventoryTransactionIds',
  foreignField: '_id'
});
const ProductReturnCollection = mongoose.model(
  'product_return',
  ProductReturnSchema,
  'product_return'
);

export default ProductReturnCollection;
