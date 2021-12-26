import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import multer from 'multer';
import fileActions from './file.controller';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fileRoutes = (app: express.Application): void => {
  // app.post('/api/v1/file/:resource', upload.single('file'), fileActions.uploadFileAction);
  app.post('/api/v1/file/:resource(medicine)', upload.single('file'), middleware.authorization([[ROOT_RESOURCES.cms, CORE_ACTIONS.write]]), fileActions.uploadFileAction);

};

export default fileRoutes;
