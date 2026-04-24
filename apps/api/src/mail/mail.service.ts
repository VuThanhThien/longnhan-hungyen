import { AllConfigType } from '@/config/config.type';
import { BrevoClient } from '@getbrevo/brevo';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevo: BrevoClient;
  private readonly sender: { name: string; email: string };
  private readonly templateCache = new Map<
    string,
    Handlebars.TemplateDelegate
  >();

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.brevo = new BrevoClient({
      apiKey: this.configService.getOrThrow('mail.brevoApiKey', {
        infer: true,
      }),
    });

    this.sender = {
      name: this.configService.getOrThrow('mail.defaultName', { infer: true }),
      email: this.configService.getOrThrow('mail.defaultEmail', {
        infer: true,
      }),
    };
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const url = `${this.configService.get('app.url', { infer: true })}/api/v1/auth/verify/email?token=${token}`;

    const htmlContent = this.renderTemplate('email-verification', {
      email,
      url,
    });

    await this.sendEmail({
      to: email,
      subject: 'Email Verification',
      htmlContent,
    });
  }

  async sendOrderTrackingLink(
    email: string,
    url: string,
    orderCode: string,
  ): Promise<void> {
    const htmlContent = this.renderTemplate('order-tracking-link', {
      email,
      url,
      orderCode,
    });

    await this.sendEmail({
      to: email,
      subject: `Theo dõi đơn hàng ${orderCode}`,
      htmlContent,
    });
  }

  private renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): string {
    let compiled = this.templateCache.get(templateName);

    if (!compiled) {
      const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      compiled = Handlebars.compile(templateSource, { strict: true });
      this.templateCache.set(templateName, compiled);
    }

    return compiled(context);
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
  }): Promise<void> {
    try {
      const response = await this.brevo.transactionalEmails.sendTransacEmail({
        sender: this.sender,
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
      });

      this.logger.debug(
        `Email sent to ${params.to}, messageId: ${response.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${params.to}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
