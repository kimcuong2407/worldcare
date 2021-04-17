import middleware from '@app/core/middleware';
import express from 'express';
import multer from 'multer';
import fileActions from './file.controller';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fileRoutes = (app: express.Application): void => {
  app.post('/api/v1/file/:resource', upload.single("file"), fileActions.uploadFileAction);
};

export default fileRoutes;
