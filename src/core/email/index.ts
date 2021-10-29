import AWS from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';
import { EMAIL_SEND_FROM } from '@core/config';
import Mail from 'nodemailer/lib/mailer';
import smtp from './smtp';

class EmailClient {
  client: AWS.SES;

  static instance: EmailClient;

  constructor() {
    this.init();
  }

  init() {
    this.client = new AWS.SES({
      // endpoint: process.env.AWS_MAIL_ENDPOINT || 'https://email-smtp.us-west-2.amazonaws.com',
      apiVersion: '2010-12-01',
      region: process.env.AWS_SES_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async sendEmailSMTP(
    recipients: string[],
    subject: string,
    html: string,
    text: string,
    attachments?: Mail.Attachment[],
    from?: string,
    replyTo?: string,
    cc?: string[],
    bcc?: string[],
  ) {
    return smtp.sendMail({
      to: recipients,
      subject,
      html,
      text,
      replyTo: replyTo || '',
      from: from || EMAIL_SEND_FROM,
      bcc,
      cc,
      attachments: attachments || [],
    });
  }

  sendEmail(
    recipients: string[],
    subject: string,
    html: string,
    text: string,
    replyTo?: string[],
    cc?: string[],
    bcc?: string[],
  ) {
    const params: SendEmailRequest = {
      Source: EMAIL_SEND_FROM,
      ReplyToAddresses: replyTo || [],
      Destination: {
        ToAddresses: recipients,
        CcAddresses: cc || [],
        BccAddresses: bcc || [],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: html || '',
          },
          Text: {
            Data: text || '',
          },
        },
      },
    };
    return new Promise((resolve, reject) => {
      this.client.sendEmail(params, (error, response: SendEmailResponse) => {
        if (error) {
          return reject(error);
        }
        return resolve(response);
      });
    });
  }

  sendTemplatedEmail(
    template: string,
    recipients: string[],
    data: any,
    cc?: string[],
    bcc?: string[],
  ) {
    return this.client.sendTemplatedEmail({
      Source: process.env.EMAIL_FROM || 'IDLogiq Inc. <noreply@idlogiq.com>',
      Destination: {
        ToAddresses: recipients,
        CcAddresses: cc || [],
        BccAddresses: bcc || [],
      },
      Template: template,
      TemplateData: JSON.stringify(data),
    });
  }

  static getInstance() {
    if (!EmailClient.instance) {
      EmailClient.instance = new EmailClient();
    }
    return EmailClient.instance;
  }
}

export default EmailClient.getInstance();
