import nodemailer from 'nodemailer';
import {
  SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
} from '@core/config';

const transporter = nodemailer.createTransport({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  host: SMTP_SERVER,
  port: SMTP_PORT || 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export default transporter;
