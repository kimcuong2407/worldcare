import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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
  supplierCode: String,

  createdById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  recieverById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  }, 
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  purchaseOrderDetail: [PurchaseOrderDetail],
  paymentNote: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note'
  },
  status: String,
  deletedAt: Date,
}, {
  timestamps: true,
})


PurchaseOrderSchema.plugin(mongoosePaginate);

const PurchaseOrderCollection = mongoose.model(
  'purchase_order',
  PurchaseOrderSchema,
  'purchase_order'
);

export default PurchaseOrderCollection;