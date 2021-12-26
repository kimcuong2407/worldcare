import { setResponse } from './../../utils/response.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import { uploadImage } from './file.service';
import omit from 'lodash/omit';

const logger = loggerHelper.getLogger('user.controller');

const uploadFileAction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const resource = get(req.params, 'resource');
    const branchId = get(req, 'companyId');
    const uploadedFile = await uploadImage(req.file, `${branchId}/${resource}`);
    res.send({url: uploadedFile.Location});
  } catch (e) {
    logger.error('uploadFileAction', e);
    next(e);
  }
};

export default { uploadFileAction };
