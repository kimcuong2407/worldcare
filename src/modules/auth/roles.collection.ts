/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  branchId: {
    type: Number,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

RoleSchema.plugin(mongoosePaginate);
const RoleCollection = mongoose.model('role', RoleSchema, 'role');

export default RoleCollection;
