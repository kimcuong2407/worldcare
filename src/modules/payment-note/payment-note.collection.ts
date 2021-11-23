import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const PaymentNoteSchema = new mongoose.Schema({
  code: String,
  paymentNoteCodeSequence: Number,
  type: String, // Payment or Receipt
  transactionType: String, // PCPN, TTHD...
  // Bases on transaction type to get corresponding reference document
  referenceDocId: String,
  branchId: {
    type: Number,
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
  paymentPreAmount: Number, // Paid 
  totalPayment: Number, // Total amount => Need to pay
  status: String,
  deletedAt: Date
}, {
  timestamps: true,
});

PaymentNoteSchema.plugin(mongoosePaginate);
PaymentNoteSchema.plugin(AutoIncrement(mongoose), {
  id: 'payment_note_code_sequence',
  inc_field: 'paymentNoteCodeSequence',
  start_seq: 1,
  reference_fields: ['branchId', 'transactionType']
});

const PaymentNoteCollection = mongoose.model(
  'payment_note',
  PaymentNoteSchema,
  'payment_note'
);

export default PaymentNoteCollection;