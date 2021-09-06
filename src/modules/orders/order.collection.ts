import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './constant';
import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import PrescriptionCollection from './prescription.collection';
import OrderItemCollection from './order-item.collection';

const { Schema } = mongoose;


const OrderSchema = new Schema({
  orderNumber: {
    type: Number,
    uniqe: true,
  },
  prescriptionId: { type: Schema.Types.ObjectId, ref: 'prescription' },
  userId: String,
  customerId: String,
  customerNumber: String,
  branchId: Number,
  partnerId: Number,
  shippingAddressId: { type: Schema.Types.ObjectId, ref: 'user_address'},
  billingAddressId: { type: Schema.Types.ObjectId, ref: 'user_address' },
  productId: String,
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
    default: PAYMENT_METHOD.COD,
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.NEW,
  },
  subTotal: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  shippingInfo: {
    'shippingVendor': String,
    'shipperName':  String,
    'shipperPhoneNumber':  String,
    'trackingId':  String,
  },
  deliveryMethod: String,
  deliveryId: String,
  customerNote: String,
  cancelReason: String,
  rejectReason: String,
  history: [
    {
      _id: false,
      action: String,
      timestamp: Date,
      authorId: String,
      message: String,
    }
  ],
  deletedAt: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc) => {

    }
  }
});

OrderSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'orderNumber',
});
OrderSchema.index({ orderNumber: 1 }, { unique: true })

OrderSchema.virtual('shippingAddress', {
  ref: 'user_address', // the collection/model name
  localField: 'shippingAddressId',
  foreignField: '_id',
  justOne: true, // default is false
});

OrderSchema.virtual('shopInfo', {
  ref: 'branch', // the collection/model name
  localField: 'branchId',
  foreignField: '_id',
  justOne: true, // default is false
  options: { select: 'name -_id -id -branchId', projection: { name: 1, branchId: -1, _id: -1, id: -1} },
});

OrderSchema.virtual('items', {
  ref: OrderItemCollection, // the collection/model name
  localField: 'orderNumber',
  foreignField: 'orderNumber',
  options: {},
});


OrderSchema.virtual('prescription', {
  ref: 'prescription', // the collection/model name
  localField: 'prescriptionId',
  foreignField: '_id',
  justOne: true, // default is false
  // options: { select: 'name -_id -id -branchId', projection: { name: 1, branchId: -1, _id: -1, id: -1} },
});
OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(mongooseAggregatePaginate);

const OrderCollection = mongoose.model('order', OrderSchema, 'order');

export default OrderCollection;
