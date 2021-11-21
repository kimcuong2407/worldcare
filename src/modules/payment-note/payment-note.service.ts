import { PAYMENT_NOTE_STATUS } from "./constant";
import PaymentNoteCollection from "./payment-note.collection";

const createPaymentNote = async (info: any) => {
  const created  = await PaymentNoteCollection.create(info);
  const record = await PaymentNoteCollection.findOne({
    _id: created._id,
  });
  return record;
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