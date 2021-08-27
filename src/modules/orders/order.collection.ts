import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './constant';
import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import PrescriptionCollection from './prescription.collection';

const { Schema } = mongoose;


const OrderSchema = new Schema({
  orderNumber: {
    type: Number,
    uniqe: true,
  },
  prescriptionId: { type: Schema.Types.ObjectId, ref: 'prescription' },
  userId: String,
  customerId: String,
  branchId: Number,
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
  subTotal: Number,
  grandTotal: Number,
  deliveryMethod: String,
  deliveryId: String,
  customerNote: String,
  history: [
    {
      action: String,
      timestamp: Date,
      actor: String,
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
  ref: 'company', // the collection/model name
  localField: 'companyId',
  foreignField: 'companyId',
  justOne: true, // default is false
  options: { select: 'name -_id -id -companyId', projection: { name: 1, companyId: -1, _id: -1, id: -1} },
});

OrderSchema.virtual('prescription', {
  ref: 'prescription', // the collection/model name
  localField: 'prescriptionId',
  foreignField: '_id',
  justOne: true, // default is false
  // options: { select: 'name -_id -id -companyId', projection: { name: 1, companyId: -1, _id: -1, id: -1} },
});
OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(mongooseAggregatePaginate);

const OrderCollection = mongoose.model('order', OrderSchema, 'order');

export default OrderCollection;
