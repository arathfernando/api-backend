import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AppService {
  constructor(@InjectQueue('email-sender') private taskQueue: Queue) {}
  public async sendEmail(data): Promise<void> {
    console.log('Mail', data);
    const res = await this.taskQueue.add('send', data, { backoff: 3 });
    console.log(res);
  }
}
