import {InternalServerError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import {PAYMENT_NOTE_STATUS, PAYMENT_NOTE_TYPE, PaymentNoteConstants, TARGET} from './constant';
import PaymentNoteCollection from './paymentNote.collection';
import loggerHelper from '@utils/logger.util';
import documentCodeUtils from '@utils/documentCode.util';
import customerService from '../customer-v2/customerV2.service';
import supplierService from '../supplier/supplier.service';
import employeeService from '../employee/employee.service';
import partnerService from '../partner/partner.service';
const logger = loggerHelper.getLogger('payment-note.service');

const initIdSequence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const paymentNoteAutoIncrease = (record: any, type: string) => {
  record.setNext('payment_note_code_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const paymentNoteCode = `${type}${initIdSequence(record.codeSequence)}`
    const doc = await PaymentNoteCollection
      .findOne({code: paymentNoteCode, branchId: get(record, '_doc.branchId')})
      .lean().exec();
    if(!isNil(doc)) paymentNoteAutoIncrease(record, type);
    record.variantId = paymentNoteCode;
    record.save();
  });
}

const persistsPaymentNote = async (info: any, type: string) => {
  const transactionType = info.type == PAYMENT_NOTE_TYPE.PAYMENT ? PaymentNoteConstants.TTM : PaymentNoteConstants.CTM;
  const invoice = await PaymentNoteCollection.create(info);
  invoice.transactionType = transactionType.symbol;
  invoice.code = documentCodeUtils.initDocumentCode(transactionType.symbol, invoice.paymentNoteCodeSequence);
  await invoice.save();

  return {
    ...get(invoice, '_doc', {})
  }
}

const createPaymentNote = async (info: any) => {
  const type = get(info, 'type');
  info.status = PAYMENT_NOTE_STATUS.ACTIVE;
  return await persistsPaymentNote(info, type);
};

const fetchPaymentNoteListByQuery = async (query: any) => {
  const list = await PaymentNoteCollection.find(query)
    .lean()
    .sort({ index: 1, createdAt: 1 }).exec();
  return list;
};

const fetchPaymentNoteInfoByQuery = async (query: any) => {
  return await PaymentNoteCollection
    .findOne(query)
    .populate('referenceDoc')
    .populate('branch')
    .populate({path: 'createdBy', select: '-password'})
    .populate('customer')
    .populate('supplier')
    .lean().exec();
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

const cancelPaymentNote = async (query: any) => {
  logger.info('Canceling payment note. query=' + JSON.stringify(query))
  return PaymentNoteCollection.updateOne(
    query,
    {
      $set: {
        status: PAYMENT_NOTE_STATUS.CANCELED
      },
    },
    {new: true}
  );
};

/**
 *
 * Create paymentNote bases on transaction type.
 *
 * @param payment: Payment info
 * @param info: payment note additional info such as: branchId, involvedById, createdById, supplierId
 * @param transactionType
 * @param isIncome: if True, PaymentNoteType is RECEIPT, else PAYMENT
 * @param referenceDocId
 */
const createPaymentNoteWithTransactionType = async (payment: any, info: any,
                                 transactionType: PaymentNoteConstants.TransactionType,
                                 isIncome: boolean,
                                 referenceDocId: string = undefined) => {
  if (isNil(transactionType) || isNil(isIncome)) {
    logger.warn(`Transaction type is null. payment=${JSON.stringify(payment)}. info=${JSON.stringify(info)}`);
    return null;
  }
  if (payment && payment.amount && payment.amount > 0) {
    const paymentNoteInfo = {
      status: PAYMENT_NOTE_STATUS.ACTIVE,
      type: isIncome ? PAYMENT_NOTE_TYPE.RECEIPT : PAYMENT_NOTE_TYPE.PAYMENT,
      transactionType: transactionType.symbol,
      referenceDocName: transactionType.referenceDocName,
      referenceDocId: referenceDocId,
      branchId: info.branchId,
      involvedById: info.involvedById,
      createdById: info.createdBy,
      supplierId: info.supplierId,
      customerId: info.customerId,
      paymentMethod: payment.method,
      paymentDetail: payment.detail,
      paymentAmount: payment.amount,
      totalPayment: payment.totalPayment
    };

    let paymentNote = await PaymentNoteCollection.create(paymentNoteInfo);
    paymentNote.code = documentCodeUtils.initDocumentCode(transactionType.symbol, paymentNote.paymentNoteCodeSequence);
    logger.info(`Saving payment note with code[${paymentNote.code}]`)
    await paymentNote.save();
    logger.info(`Created payment note with code[${paymentNote.code}]`)
    return paymentNote;
  }
  return null;
}

const searchPayerReceiver = async (keyword: string, target: string, partnerId: number) => {
  let data;
  switch(target){
    case TARGET.CUSTOMER: {
      const customers = await customerService.searchCustomer(keyword, partnerId);
      data = customers.map( (customer) => {
        return {
          _id: customer._id,
          name: customer.name,
          code: customer.code
        }
      });
      break;
    }
    case TARGET.EMPLOYEE: {
      const employees = await employeeService.searchEmplyee(keyword, partnerId);
      data = employees.map((employee) => {
        return {
          _id: employee._id,
          name: employee.fullName,
          code: employee.employeeNumber
        }
      });
      break;
    }
    case TARGET.SUPPLIER: {
      const suppliers = await supplierService.searchSupplier(keyword, partnerId);
      data = suppliers.map((supplier) => {
        return {
          _id: supplier._id,
          name: supplier.name,
          code: supplier.supplierCode
        }
      });
      break;
    }
    case TARGET.PARTNER: {
      const partners = await partnerService.searchPartner(keyword);
      data = partners.map((partner) =>{
        return {
          _id: partner._id,
          name: partner.name,
          code: partner.partnerCode
        }
      });
      break;
    }
    default:
      return [];
  }
  return data;
}


export default {
  createPaymentNote,
  fetchPaymentNoteListByQuery,
  fetchPaymentNoteInfoByQuery,
  updatePaymentNote,
  deletePaymentNote,
  createPaymentNoteWithTransactionType,
  cancelPaymentNote,
  searchPayerReceiver
};