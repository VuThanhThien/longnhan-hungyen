import {
  IOrderTrackingLinkJob,
  IVerifyEmailJob,
} from '@/common/interfaces/job.interface';
import { MailService } from '@/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private readonly mailService: MailService) {}

  async sendEmailVerification(data: IVerifyEmailJob): Promise<void> {
    this.logger.debug(`Sending email verification to ${data.email}`);
    await this.mailService.sendEmailVerification(data.email, data.token);
  }

  async sendOrderTrackingLink(data: IOrderTrackingLinkJob): Promise<void> {
    this.logger.debug(`Sending order tracking link to ${data.email}`);
    await this.mailService.sendOrderTrackingLink(
      data.email,
      data.url,
      data.orderCode,
    );
  }
}
