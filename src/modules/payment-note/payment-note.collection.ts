import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from "mongoose-sequence";

const PaymentNoteSchema = new mongoose.Schema({
  code: String,
  idSequence: Number,
  type: String,
  branchId: {
    type: mongoose.Types.ObjectId,
    ref: 'branch'
  },
  supplierId: String,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
  },
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createdById: {
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
PaymentNoteSchema.plugin(AutoIncrement(mongoose), {
  id: 'payment_id_sequence',
  inc_field: 'idSequence',
  reference_fields: ['branchId'],
  start_seq: 1,
  disable_hooks: true
});

const PaymentNoteCollection = mongoose.model(
  'payment_note',
  PaymentNoteSchema,
  'payment_note'
);

export default PaymentNoteCollection;