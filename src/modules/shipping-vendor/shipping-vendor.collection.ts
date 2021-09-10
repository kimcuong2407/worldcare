import mongooseIntl from 'mongoose-intl';
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import get from 'lodash/get';
import last from 'lodash/last';

const { Schema } = mongoose;

const ShippingVendorSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

ShippingVendorSchema.plugin(mongoosePaginate);

const ShippingVendorCollection = mongoose.model('shipping_vendor', ShippingVendorSchema, 'shipping_vendor');

export default ShippingVendorCollection;
