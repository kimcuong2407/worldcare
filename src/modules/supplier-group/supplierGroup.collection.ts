/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const SupplierGroupSchema = new Schema({
  name: String,
  description: String,
  status: String,
  partnerId: Number,
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  __v: { type: Number, select: false }
}, {
  timestamps: true
});

SupplierGroupSchema.plugin(mongoosePaginate);

const SupplierGroupCollection = mongoose.model('supplier_group', SupplierGroupSchema, 'supplier_group');

export default SupplierGroupCollection;
