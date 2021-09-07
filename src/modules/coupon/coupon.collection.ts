import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const CouponSchema = new Schema({
  name: String,
  description: String,
  code: {
    type: String,
    unique: true,
  },
  startTime: Date,
  endTime: Date,
  discountValue: Number,
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
  },
  isFreeShipping: {
    type: Boolean,
    default: false,
  },
  maxShippingDiscount: Number,
  maxDiscount: Number,
  maxUsage: {
    type: Number
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  conditions: [{
    type: String,
    condition: Object
  }],
  deletedAt: Date,
}, {
  timestamps: true,
});

CouponSchema.plugin(mongoosePaginate);

const CouponCollection = mongoose.model('coupon', CouponSchema, 'coupon');

export default CouponCollection;
