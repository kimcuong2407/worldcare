import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const { Schema } = mongoose;

const BranchWorkingHoursSchema = new Schema({
  isOpen: Boolean,
  openingHours: [
    {
      startTime: String,
      endTime: String,
    }
  ]
}, {
  id: false,
  toJSON: {
    virtuals: true,
  }
});

const BranchSchema = new Schema({
  name: {
    type: String,
    intl: true,
  },
  parentId: Number,
  partnerId: Number,
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
  branchType: [String],
  entityType: String,
  speciality: [{ type: Schema.Types.ObjectId, ref: 'speciality' }],
  address: {
    street: String,
    wardId: String,
    districtId: String,
    cityId: String,
  },
  workingHours: [Object],
  branchSettings: {
    slotTime: Number,
    capacityPerSlot: Number,
  },
  logo: String,
  photos: [String],
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

BranchSchema.plugin(AutoIncrement(mongoose), {
  inc_field: '_id',
  id: 'branch_id_by_company',
  // startAt: 10005,
  // incrementBy: 1
});

BranchSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
BranchSchema.plugin(mongoosePaginate);
BranchSchema.plugin(mongooseAggregatePaginate);

const BranchCollection = mongoose.model('branch', BranchSchema, 'branch');

export default BranchCollection;
