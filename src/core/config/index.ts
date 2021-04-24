export const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/worldcare';
export const PORT = process.env.PORT || 3500;
export const ACCEPTED_LANGUAGES = ['en', 'vi'];


export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
export const S3_API_VERSION = process.env.S3_API_VERSION || '2006-03-01';
export const S3_REGION = process.env.S3_REGION || 'ap-southeast-1';
export const S3_BUCKET = process.env.S3_BUCKET || '';

export const ZALO_ACCOUNTS = process.env.ZALO_ACCOUNTS || '1242567605949002428';
export const ZALO_API = 'https://openapi.zalo.me';
export const ZALO_OA_TOKEN = process.env.ZALO_OA_TOKEN;