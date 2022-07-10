import makeQuery from "@app/core/database/query"
import PaymentNoteTypeCollection from "./paymentNoteType.collection"


const createPaymentNoteType = async (info: any) => {
  return makeQuery(PaymentNoteTypeCollection.create(info));
}

const fetchPaymentNoteTypeListByQuery = async (query: any) => {
  const list = await PaymentNoteTypeCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
}


export default {
  createPaymentNoteType,
  fetchPaymentNoteTypeListByQuery
};