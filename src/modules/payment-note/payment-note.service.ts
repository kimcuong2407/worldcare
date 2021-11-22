import { InternalServerError } from "@app/core/types/ErrorTypes";
import get from "lodash/get";
import isNil from "lodash/isNil";
import { PAYMENT_NOTE_STATUS } from "./constant";
import PaymentNoteCollection from "./payment-note.collection";


const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const paymentNoteAutoIncrease = (record: any, type: string) => {
  record.setNext('variant_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `${type}${initIdSquence(record.idSequence)}`
    const doc = await PaymentNoteCollection.findOne({increasedId}).lean().exec();
    if(!isNil(doc)) paymentNoteAutoIncrease(record, type);
    record.variantId = increasedId;
    record.save();
  });
}

const persistsPaymnentNote = async (info: any, type: string) => {
  const code = get(info, 'code', null);
  const invoice = await PaymentNoteCollection.create(info);
  if (isNil(code)) {
    paymentNoteAutoIncrease(invoice, type);
  }

  return {
    ...get(invoice, '_doc', {})
  }
}

const createPaymentNote = async (info: any) => {
  const type = get(info, 'type');
  info.status = PAYMENT_NOTE_STATUS.ACTIVE;
  return await persistsPaymnentNote(info, type);
};

const fetchPaymentNoteListByQuery = async (query: any) => {
  const list = await PaymentNoteCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
};

const fetchPaymentNoteInfoByQuery = async (query: any) => {
  const record = await PaymentNoteCollection.findOne(query).lean().exec();
  return record;
};

const updatePaymentNote = async (query: any, info: any) => {
  return await PaymentNoteCollection.updateOne(
    query,
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

const deletePaymentNote = async (query: any) => {
  return await PaymentNoteCollection.updateOne(
    query,
    {
      $set: {
        status: PAYMENT_NOTE_STATUS.INACTIVE,
        deletedAt: new Date()
      },
    },
    { new: true }
  );
};

export default {
  createPaymentNote,
  fetchPaymentNoteListByQuery,
  fetchPaymentNoteInfoByQuery,
  updatePaymentNote,
  deletePaymentNote,
};