import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  orderId: {
    type: String,
  },
  orderNumber: {
    type: Number,
  },
  productId: String,
  productName: String,
  productDescription: String,
  instruction: String,
  saleQuantity: Number,
  saleUnit: String,
  note: String,
  price: Number,
}, {
  timestamps: true,
});

OrderItemSchema.index({ orderNumber: 1 })

OrderItemSchema.plugin(mongoosePaginate);

const OrderItemCollection = mongoose.model('order_item', OrderItemSchema, 'order_item');

export default OrderItemCollection;
