import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import { ENTITY_TYPE } from './constant';

const { Schema } = mongoose;

const PartnerSchema = new Schema({
  name: {
    type: String,
  },
  partnerCode: {
    type: String,
    uniqe: true,
  },
  modules: {
    type: [String],
    enum: Object.values(ENTITY_TYPE),
  },
  description: {
    type: String,
  },
  email: {
    type: String,
    index: true,
  },
  phoneNumber: {
    type: String,
    index: true,
  },
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  },
  logo: String,
  deletedAt: Date,
}, {
  _id: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

PartnerSchema.plugin(AutoIncrement(mongoose), {
  inc_field: '_id',
  id: 'partner_id',
  // startAt: 10005,
  // incrementBy: 1
});
PartnerSchema.index({ partnerCode: 1 }, { unique: true })
PartnerSchema.plugin(mongoosePaginate);
PartnerSchema.plugin(mongooseAggregatePaginate);

const PartnerCollection = mongoose.model('partner', PartnerSchema, 'partner');

export default PartnerCollection;
