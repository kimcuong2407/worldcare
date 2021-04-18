import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const { Schema } = mongoose;

const HospitalWorkingHoursSchema = new Schema({
  weekDay: {
    type: String,
    intl: true,
  },
  isOpen: Boolean,
  startTime: String,
  endTime: String,
}, {
  timestamps: true,
  id: false,
  // toJSON: {
  //   virtuals: true,
  // }
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
  workingHours: [HospitalWorkingHoursSchema],
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
}, {
  timestamps: true,
  // toJSON: {
  //   virtuals: true,
  // }
});

HospitalSchema.plugin(mongooseIntl, { languages: ['vi', 'en'], defaultLanguage: 'vi' });
HospitalSchema.plugin(mongoosePaginate);

const HospitalCollection = mongoose.model('hospital', HospitalSchema, 'hospital');

export default HospitalCollection;
