import loggerHelper from '@utils/logger.util';
import {isNil} from 'lodash';
import get from 'lodash/get';
import prescriptionCollection from './prescription.collection';
import {InternalServerError} from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('prescription.service');

const initPrescriptionCode = (prescriptionCodeSeq: number) => {
  let s = '000000000' + prescriptionCodeSeq;
  return 'DT' + s.substr(s.length - 6);
}

const autoIncrease = (record: any) => {
  return new Promise(((resolve, reject) => {
    record.setNext('prescription_code_sequence', async (err: any, record: any) => {
      if (err) {
        reject(err);
      }
      record.code = initPrescriptionCode(record.prescriptionCodeSequence);
      await record.save();
      resolve(record);
    });
  })).catch(() => {
    throw new InternalServerError('Failed to increase prescriptionCode.');
  })
}

const persistPrescription = async (prescriptionInfo: any) => {
  const prescriptionCode = get(prescriptionInfo, 'code', null);

  const prescription = await prescriptionCollection.create(prescriptionInfo);
  if (isNil(prescriptionCode)) {
    await autoIncrease(prescription);
  }

  return {
    ...get(prescription, '_doc', {}),
  };
};

export default {
  persistPrescription
};
