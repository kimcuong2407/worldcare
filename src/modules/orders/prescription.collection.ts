import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import autoIncrement from 'mongoose-auto-increment';

const { Schema } = mongoose;
const PrescriptionSchema = new Schema({
  orderId: {
    type: String,
  },
  orderNumber: {
    type: String,
  },
  images: [String],
  doctorId: String,
  note: String,
}, {
  timestamps: true,
});

PrescriptionSchema.plugin(mongoosePaginate);
PrescriptionSchema.plugin(mongooseAggregatePaginate);

const PrescriptionCollection = mongoose.model('prescription', PrescriptionSchema, 'prescription');

export default PrescriptionCollection;
