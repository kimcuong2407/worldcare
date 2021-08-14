import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './constant';
import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;


const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    uniqe: true,
  },
  prescriptionId: String,
  userId: String,
  customerId: String,
  companyId: Number,
  shippingAddressId: String,
  billingAddressId: String,
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
});

OrderSchema.plugin(autoIncrement.plugin, {
  model: 'order',
  field: 'orderNumber',
  startAt: 40005,
  incrementBy: 1
});
OrderSchema.index({ orderNumber: 1 }, { unique: true })

OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(mongooseAggregatePaginate);

const OrderCollection = mongoose.model('order', OrderSchema, 'order');

export default OrderCollection;
