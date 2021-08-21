import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import { ENTITY_TYPE } from './constant';

const { Schema } = mongoose;

const CompanyWorkingHoursSchema = new Schema({
  isOpen: Boolean,
  startTime: String,
  endTime: String,
}, {
  id: false,
  toJSON: {
    virtuals: true,
  }
});

const CompanySchema = new Schema({
  name: {
    type: String,
    intl: true,
  },
  companyCode: {
    type: String,
    uniqe: true,
  },
  companyType: {
    type: String,
    enum: Object.values(ENTITY_TYPE),
  },
  description: {
    type: String,
    intl: true,
  },
  email: {
    type: String,
    index: true,
  },
  phoneNumber: {
    type: String,
    index: true,
  },
  services: [{
    type: Object,
    _id: false
  }],
  diseases: [String],
  modules: [String],
  entityType: String,
  speciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
  },
  workingHours: [Object],
  hospitalSettings: {
    slotTime: Number,
    capacityPerSlot: Number,
  },
  logo: String,
  photos: [String],
  lastActivity: Date,
  slug: {
    type: String,
    unique: true,
  },
  deletedAt: Date,
}, {
  _id: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

CompanySchema.plugin(AutoIncrement(mongoose), {
  inc_field: '_id',
  id: 'company_id',
  // startAt: 10005,
  // incrementBy: 1
});
CompanySchema.index({ companyCode: 1 }, { unique: true })

CompanySchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
CompanySchema.plugin(mongoosePaginate);
CompanySchema.plugin(mongooseAggregatePaginate);

const CompanyCollection = mongoose.model('company', CompanySchema, 'company');

export default CompanyCollection;
