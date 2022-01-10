import loggerHelper from '@utils/logger.util';
import PaymentNoteCollection from '@modules/payment-note/payment-note.collection';
import {PAYMENT_NOTE_TYPE} from '@modules/payment-note/constant';
import {isNil} from 'lodash';

const logger = loggerHelper.getLogger('batch.service');

async function getGeneralLedgerSummary(query: any) {
  const generalLedgerReport = await PaymentNoteCollection.aggregate([
    {
      $match: query
    },
    {
      $project: {
        _id: 0,
        type: 1,
        paymentAmount: 1
      }
    },
    {
      $group: {
        _id: '$type',
        sum: {
          $sum: '$paymentAmount'
        }
      }
    }
  ]).exec();

  const totalIncome = generalLedgerReport
    .find((element: any) => element['_id'] === PAYMENT_NOTE_TYPE.RECEIPT);
  const totalSpending = generalLedgerReport
    .find((element: any) => element['_id'] === PAYMENT_NOTE_TYPE.PAYMENT);
  return {
    totalIncome: totalIncome ? totalIncome.sum : 0,
    totalSpending: totalSpending ? totalSpending.sum : 0
  };
}

const fetchGeneralLedger = async (queryInfo: any, options: any) => {

  const query: any = {
    deletedAt: null,
    branchId: queryInfo.branchId
  }
  if (isNil(queryInfo.allTime) || !queryInfo.allTime) {
    if (queryInfo.startRangeTime) {
      query.createdAt = {
        $gte: queryInfo.startRangeTime,
      }
    }
    if (queryInfo.endRangeTime) {
      query.createdAt = {
        $lte: queryInfo.endRangeTime
      }
    }
  }
  if (queryInfo.code) {
    query.code = {
      $regex: '.*' + queryInfo.code + '.*', $options: 'i'
    }
  }
  if (queryInfo.note) {
    query.note = {
      $regex: '.*' + queryInfo.note + '.*', $options: 'i'
    }
  }
  if (queryInfo.type) {
    query.type = queryInfo.type
  }
  if (queryInfo.createdById) {
    query.createdById = queryInfo.createdBy
  }
  if (queryInfo.involvedById) {
    query.involvedById = queryInfo.involvedById
  }
  const generalLedgerSummary = await getGeneralLedgerSummary(query);

  const paymentNotes = await PaymentNoteCollection.paginate(query, {
    ...options,
    sort: {
      createdAt: -1
    },
    populate: [
      {path: 'customer', select: ['_id', 'name']},
      {path: 'referenceDoc', select: ['-invoiceDetail']},
      {path: 'createdBy', select: ['-password']}
    ]
  })

  const {docs, ...rest} = paymentNotes;

  return {
    docs,
    ...rest,
    generalLedgerSummary
  }
}

export default {
  fetchGeneralLedger
};
