import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import addressUtil from '@app/utils/address.util';

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
  isPublic: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    unique: true,
  },
  pharmacyRegistrationNumber: String,
  businessRegistrationCertificate: String,
  pharmacyType: String,
  representativeName: String,
  representativeCertificateNumber: String,
  representativePhoneNumber: String,
  responsiblePersonName: String,
  practicingCertificateNumber: String,
  professionalQualification: String,
  responsiblePersonPhone: String,
  responsiblePersonEmail: String,
  pharmacyConnectCode: String,
  pharmacyConnectUsername: String,
  pharmacyConnectPassword: String,
  deletedAt: Date,
}, {
  _id: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      const { address } = ret;
      return {
        ...ret,
        address: addressUtil.formatAddressV2(address)
      };
    }
  }
});

BranchSchema.plugin(AutoIncrement(mongoose), {
  inc_field: '_id',
  id: 'branch_id_by_company',
  start_seq: 10001,
  // startAt: 10005,
  // incrementBy: 1
});

BranchSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
BranchSchema.plugin(mongoosePaginate);
BranchSchema.plugin(mongooseAggregatePaginate);

const BranchCollection = mongoose.model('branch', BranchSchema, 'branch');

export default BranchCollection;
