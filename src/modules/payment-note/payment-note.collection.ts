import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const PaymentNoteSchema = new mongoose.Schema({
  code: String,
  type: String,
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  supplier: String,
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  involvedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  paymentMethod: String,
  paymentDetail: Object,
  paymentAmount: Number,
  paymentPreAmount: Number,
  totalPayment: Number,
  status: String,
  deletedAt: Date,
}, {
  timestamps: true,
});

PaymentNoteSchema.plugin(mongoosePaginate);

const PaymentNoteCollection = mongoose.model(
  'payment_note',
  PaymentNoteSchema,
  'payment_note'
);

export default PaymentNoteCollection;