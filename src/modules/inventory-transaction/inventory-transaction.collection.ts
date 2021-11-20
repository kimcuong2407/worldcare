import mongoose from 'mongoose';

const InventoryTransactionScheam = new mongoose.Schema({
  type: String,
  supplierId: String,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  partnerId: {
    type: mongoose.Types.ObjectId,
    ref: 'partner'
  },
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  productId: String,
  variantId: String,
  quantity: Number,
}, {
  timestamps: true,
});
