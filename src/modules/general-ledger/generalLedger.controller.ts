import express from 'express';
import loggerHelper from '@utils/logger.util';
import generalLedgerService from './generalLedger.service';
import {isNil} from 'lodash'
import appUtil from '@utils/app.util';

const logger = loggerHelper.getLogger('supplier.controller');

const fetchGeneralLedgerAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      code,
      note,
      type,
      createdById,
      involvedById,
      startRangeTime,
      endRangeTime,
      allTime
    } = req.query;
    const branchId = isNil(req.query.branchId) ? req.companyId : req.query.branchId;

    const {page, limit} = appUtil.getPaging(req);
    const options = {
      page,
      limit,
    }
    const queryInfo = {
      code,
      note,
      type,
      createdById,
      involvedById,
      branchId,
      startRangeTime,
      endRangeTime,
      allTime
    }
    const data = await generalLedgerService.fetchGeneralLedger(queryInfo, options);
    res.send(data);
  } catch (e) {
    logger.error('Error while fetchGeneralLedgerAction', e);
    next(e);
  }
};

export default { fetchGeneralLedgerAction };

