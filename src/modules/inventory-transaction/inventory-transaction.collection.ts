import mongoose from 'mongoose';

const InventoryTransactionSchema = new mongoose.Schema({
  type: String,
  supplierId: String,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  partnerId: {
    type: Number,
    ref: 'partner'
  },
  branchId: {
    type: Number,
    ref: 'branch'
  },
  productId: String,
  batchId: String,
  variantId: String,
  quantity: Number,
  referenceDocId: String,
  deletedAt: Date
}, {
  timestamps: true,
});

const InventoryTransactionCollection = mongoose.model(
  'inventory_transaction',
  InventoryTransactionSchema,
  'inventory_transaction'
);

export default InventoryTransactionCollection;