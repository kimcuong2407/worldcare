import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
  },
  idSequence: Number,
  name: {
    type: String,
    required: true,
    unique: true,
  },
  aliasName: String,
  barcode: String,
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_type',
    required: true,
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'manufacturer',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_group',
    required: true,
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_position',
  },
  routeAdministrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_route_administration',
  },
  productDetail: Object,
  status: Boolean,
});

ProductSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductSchema.plugin(mongoosePaginate);
ProductSchema.plugin(AutoIncrement(mongoose), {
  id: 'product_id_sequence',
  inc_field: 'idSequence',
  start_seq: 1,
  disable_hooks: true
})

const ProductCollection = mongoose.model(
  'product',
  ProductSchema,
  'product',
);

export default ProductCollection;