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

export const SUPPORTED_CITIES = process.env.SUPPORTED_CITIES ? String(process.env.SUPPORTED_CITIES).split(',') : ['48'];


export const SMTP_SERVER = '';
export const SMTP_PORT = '';
export const SMTP_USER = '';
export const SMTP_PASSWORD = '';
export const EMAIL_SEND_FROM = '';

export const AWS_SES_REGION = '';
export const SMTP_AWS_ACCESS_KEYPASSWORD = '';
export const AWS_SECRET_KEY = '';
