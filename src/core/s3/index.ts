import S3 from 'aws-sdk/clients/s3';
import { S3_ACCESS_KEY, S3_API_VERSION, S3_BUCKET, S3_REGION, S3_SECRET_KEY } from '../config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 service object & set credentials and region
let s3: S3;
if (S3_ACCESS_KEY) {
  s3 = new S3({
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
    apiVersion: S3_API_VERSION,
    region: S3_REGION,
  });
}

export const getPreSignedUrl = async (key: string, expireSeconds?: number) => s3.getSignedUrl('getObject', {
  Key: key,
  Bucket: S3_BUCKET,
  Expires: expireSeconds || 600,
});

export default s3;
