import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import {DamageItemConstants} from './constant';

const DamageItemDetailSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product'
  },
  variantId: {
    type: mongoose.Types.ObjectId,
    ref: 'product_variant'
  },
  batchId: {
    type: mongoose.Types.ObjectId,
    ref: 'batch'
  },
  snapshotProduct: Object,
  snapshotVariant: Object,
  snapshotBatch: Object,
  quantity: Number,
  // Gia von nhap
  cost: Number,
  // totalCost = quantity * cost
  totalCost: Number
}, {
  _id: false,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

DamageItemDetailSchema.virtual('product', {
  ref: 'product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});
DamageItemDetailSchema.virtual('productVariant', {
  ref: 'product_variant',
  localField: 'variantId',
  foreignField: '_id',
  justOne: true,
});
DamageItemDetailSchema.virtual('batch', {
  ref: 'batch',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true
});

const DamageItemSchema = new mongoose.Schema({
  code: String,
  codeSequence: Number,
  inventoryTransactionIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'inventory_transaction',
      default: []
    }
  ],
  detailItems: [DamageItemDetailSchema],

  totalCost: Number,

  partnerId: Number,
  branchId: Number,
  status: {
    type: String,
    enum: Object.values(DamageItemConstants.Status)
  },
  note: String,
  processedAt: Date,
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  involvedBy: String,
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

DamageItemSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true
});

DamageItemSchema.virtual('partner', {
  ref: 'partner',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});
DamageItemSchema.virtual('inventoryTransactions', {
  ref: 'inventory_transaction',
  localField: 'inventoryTransactionIds',
  foreignField: '_id'
});

DamageItemSchema.plugin(mongoosePaginate);
DamageItemSchema.plugin(AutoIncrement(mongoose), {
  id: DamageItemConstants.CODE_SEQUENCE_NAME,
  inc_field: 'codeSequence',
  start_seq: 1,
  reference_fields: ['branchId']
});

const DamageItemCollection = mongoose.model(
  'damage_item',
  DamageItemSchema,
  'damage_item'
);

export default DamageItemCollection;