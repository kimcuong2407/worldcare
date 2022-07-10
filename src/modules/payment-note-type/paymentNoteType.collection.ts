import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PAYMENT_NOTE_TYPE } from '@modules/payment-note/constant';

const { Schema } = mongoose;

const PaymentNoteTypeSchema = new Schema({
  type: {
    type: String,
    enum: [
      PAYMENT_NOTE_TYPE.PAYMENT,
      PAYMENT_NOTE_TYPE.RECEIPT
    ]
  },
  name: String,
  description: String
}
  , {
    timestamps: true,
  });

PaymentNoteTypeSchema.plugin(mongoosePaginate);

const PaymentNoteTypeCollection = mongoose.model(
  'payment_note_type',
  PaymentNoteTypeSchema,
  'payment_note_type'
);

export default PaymentNoteTypeCollection;