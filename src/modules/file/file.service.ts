import { S3_BUCKET } from './../../core/config/index';
import { InternalServerError } from '@app/core/types/ErrorTypes';
import { ValidationFailedError } from './../../core/types/ErrorTypes';
import s3 from '@app/core/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import S3, { ManagedUpload } from 'aws-sdk/clients/s3';

const IMAGE_UPLOAD_TIMEOUT = 2 * 60 * 1000;

const uploadImage = async (file: any, resourcePath: string): Promise<any> => {

  if (!file) {
    throw new Error('File is empty')
  }

  if (!file.mimetype || !(file.mimetype.match(/image\/.*/i) || file.mimetype.match(/application\/pdf/i))) {
    throw new ValidationFailedError('Invalid file type')
  }

  if (file.size > 1024 * 1024 * 10) {
    throw new ValidationFailedError('Filesize cannot exceed 10MB')
  }

  if (!s3) {
    throw new InternalServerError('S3 is not initialized')
  }

  /**
   * We will replace the name to avoid collisions
   */
  const ext = path.extname(file.originalname);
  const filename = [resourcePath, '/', uuidv4(), ext].join('');

  const uploadParams: S3.PutObjectRequest = {
    Bucket: S3_BUCKET,
    Key: filename,
    Body: file.buffer,
    // ACL: 'public-read',
    ContentLength: file.size,
    ContentType: file.mimetype,
  };
  // call S3 to retrieve upload file to specified bucket
  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err: any, data: ManagedUpload.SendData) => {
      if (err) {
        return reject(err);
      }
      if (data) {
        return resolve(data);
      }
    });
  });
}

export {
  uploadImage
}
