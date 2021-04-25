import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const { Schema } = mongoose;

const HospitalWorkingHoursSchema = new Schema({
  isOpen: Boolean,
  startTime: String,
  endTime: String,
}, {
  id: false,
  toJSON: {
    virtuals: true,
  }
});

const HospitalSchema = new Schema({
  __v: { type: Number, select: false },
  hospitalName: {
    type: String,
    intl: true,
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
  timestamps: true,
  toJSON: {
    virtuals: true,
  }
});

HospitalSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
HospitalSchema.plugin(mongoosePaginate);
HospitalSchema.plugin(mongooseAggregatePaginate);

const HospitalCollection = mongoose.model('hospital', HospitalSchema, 'hospital');

export default HospitalCollection;
