import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFile } from 'fs';
import * as _ from 'lodash';
import * as SendGrid from '@sendgrid/mail';
import { EmailTemplates } from 'src/helpers/constants/email-templates.constant';
@Processor('email-sender')
export class TaskProcessor {
  logger: Logger;
  constructor(private configService: ConfigService) {
    this.logger = new Logger();
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  @Process('send')
  async senderHandler(job) {
    try {
      // eslint-disable-next-line prefer-const
      let { template, payload } = job.data;
      template = EmailTemplates[template];
      const templatePath = join(__dirname, '../templates/', `${template}.html`);
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
      let _content = await this.readFilePromise(templatePath);
      const compiled = _.template(_content);
      _content = compiled(payload.data);
      await SendGrid.send({
        from: {
          name: 'Hubbers Notification',
          email: 'hello@hubbers.io',
        },
        to: payload.emails,
        html: _content,
        subject: payload.subject,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  readFilePromise(filePath): Promise<string> {
    return new Promise((resolve, reject) => {
      readFile(filePath, 'utf8', (err, html) => {
        if (!err) {
          resolve(html);
        } else {
          reject(err);
        }
      });
    });
  }
}
