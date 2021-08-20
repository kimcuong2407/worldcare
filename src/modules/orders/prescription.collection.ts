import mongooseIntl from 'mongoose-intl';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { getPreSignedUrl } from '@app/core/s3';
import { get, map } from 'lodash';

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
  toJSON: {
    // transform: async(doc, ret) => {
    //   const images = await Promise.all(map(get(ret, 'images', []), (image)=> getPreSignedUrl(image)));
    //   // console.log()
    //   console.log(images)
    //   return {
    //     ...ret,
    //     images,
    //   }
    // }
  }
});

PrescriptionSchema.plugin(mongoosePaginate);
PrescriptionSchema.plugin(mongooseAggregatePaginate);

const PrescriptionCollection = mongoose.model('prescription', PrescriptionSchema, 'prescription');

export default PrescriptionCollection;
