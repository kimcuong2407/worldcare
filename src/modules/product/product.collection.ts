import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import { PRODUCT_CODE_SEQUENCE, PRODUCT_STATUS } from './constant';

const DetailDescription = new mongoose.Schema({
  quantityMin: {
    type: Number,
  },
  quantityMax: { 
    type: Number,
  },
  description: { 
    type: String,
  },
  noteTemplate: {
    type: String,
  },
}, {
  timestamps: true,
});

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
  },
  codeSequence: Number,
  name: {
    type: String,
    required: true,
  },
  aliasName: String,
  barcode: String,
  branchId: {
    type: Number,
    ref: 'branch'
  },
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
  status: {
    type: String,
    default: PRODUCT_STATUS.ACTIVE,
  },
  detailDescription: DetailDescription,
}, {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
});

ProductSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true,
});
ProductSchema.virtual('manufacturer', {
  ref: 'manufacturer',
  localField: 'manufacturerId',
  foreignField: '_id',
  justOne: true,
});
ProductSchema.virtual('productType', {
  ref: 'product_type',
  localField: 'typeId',
  foreignField: '_id',
  justOne: true,
});
ProductSchema.virtual('productGroup', {
  ref: 'product_group',
  localField: 'groupId',
  foreignField: '_id',
  justOne: true,
});
ProductSchema.virtual('productPosition', {
  ref: 'product_position',
  localField: 'positionId',
  foreignField: '_id',
  justOne: true,
});
ProductSchema.virtual('routeAdministration', {
  ref: 'product_route_administration',
  localField: 'routeAdministrationId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductSchema.plugin(mongoosePaginate);
ProductSchema.plugin(AutoIncrement(mongoose), {
  id: PRODUCT_CODE_SEQUENCE,
  inc_field: 'codeSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
})
ProductSchema.index({ productCode: 'text', name: 'text', aliasName: 'text' })

const ProductCollection = mongoose.model(
  'product',
  ProductSchema,
  'product',
);

export default ProductCollection;