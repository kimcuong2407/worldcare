import express from 'express';
import loggerHelper from '@utils/logger.util';
import serverService from './server.service';
import { InternalServerError } from '@app/core/types/ErrorTypes';

const logger = loggerHelper.getLogger('server.controller');

const serverStatusAction = (req: express.Request, res: express.Response): void => {
  try {
    const server = serverService.getVersion();
    res.send(server);
  } catch (e) {
    logger.error('express-server-status> Error reading version', e);
    throw new InternalServerError(e || 'Error');
  }
};

export default { serverStatusAction };
