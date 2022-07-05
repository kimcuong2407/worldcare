import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import {PAYMENT_NOTE_STATUS, PAYMENT_NOTE_TYPE, PaymentNoteConstants, TARGET} from '@modules/payment-note/constant';

const { Schema } = mongoose;

const PaymentNoteSchema = new Schema({
  code: String,
  paymentNoteCodeSequence: Number,
  type: { 
    type: String,
    enum: [
      PAYMENT_NOTE_TYPE.PAYMENT,
      PAYMENT_NOTE_TYPE.RECEIPT
    ]
  },
  transactionType: { 
    type: String,
    enum: [
      PaymentNoteConstants.PCPN.symbol,
      PaymentNoteConstants.TTHD.symbol,
      PaymentNoteConstants.TTDH.symbol,
      PaymentNoteConstants.PTTHN.symbol,
      PaymentNoteConstants.TTM.symbol,
      PaymentNoteConstants.CTM.symbol,
      PaymentNoteConstants.TTTH.symbol,
      PaymentNoteConstants.TTHDD_TH.symbol
    ]
  },
  // Bases on transaction type to get corresponding reference document
  referenceDocId: String,
  referenceDocName: String,
  note: String,
  branchId: {
    type: Number,
    ref: 'branch'
  },
  supplierId: String,
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer_v2',
  },
  involvedById: {
    type: mongoose.Types.ObjectId,
    ref: 'employee',
  },
  createdById: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  paymentNoteTypeId: {
    type: mongoose.Types.ObjectId,
    ref: 'payment_note_type'
  },
  payerReceiver: {
    _id: mongoose.Types.ObjectId,
    name: String,
    target: {
      type: String,
      enum: [
        TARGET.CUSTOMER,
        TARGET.EMPLOYEE,
        TARGET.PARTNER,
        TARGET.SUPPLIER
      ]
    }
  },
  createdDate: Date,
  description: String,
  paymentMethod: String,
  paymentDetail: Object,
  paymentAmount: Number,
  paymentPreAmount: Number, // Paid  61ae347da9673d2da37cd972
  totalPayment: Number, // Total amount => Need to pay
  status: {
    type: String,
    default: PAYMENT_NOTE_STATUS.ACTIVE,
    enum: Object.values(PAYMENT_NOTE_STATUS)
  },
  deletedAt: Date,
  __v: { type: Number, select: false }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

PaymentNoteSchema.virtual('customer', {
  ref: 'customer_v2',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
})

PaymentNoteSchema.virtual('referenceDoc', {
  refPath: 'referenceDocName',
  localField: 'referenceDocId',
  foreignField: '_id',
  justOne: true
})

PaymentNoteSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true
})

PaymentNoteSchema.virtual('createdBy', {
  ref: 'user',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true
})
PaymentNoteSchema.virtual('supplier', {
  ref: 'supplier',
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true
})
PaymentNoteSchema.virtual('paymentNoteType', {
  ref: 'payment_note_type',
  localField: 'paymentNoteTypeId',
  foreignField: '_id',
  justOne: true
})

PaymentNoteSchema.plugin(mongoosePaginate);
PaymentNoteSchema.plugin(mongooseAggregatePaginate);
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