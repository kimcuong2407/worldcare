/* eslint-disable max-len */
import { ErrorBase, InternalServerError } from '@app/core/types/ErrorTypes';
import express from 'express';
import get from 'lodash/get';

const handleError = (
  error: any,
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: express.NextFunction
): void => {
  const { httpCode } = error;
  const responsecodeStatus = (Number(httpCode) >= 100 && Number(httpCode) <= 599) ? httpCode : 500;

  if (error instanceof ErrorBase) {
    res.status(responsecodeStatus).json(error);
  } else {
    res.status(responsecodeStatus).json(new InternalServerError(get(error, 'message'), null, responsecodeStatus, get(error, 'type'), get(error, 'additionalProperties')));
  }
};
export default handleError;
