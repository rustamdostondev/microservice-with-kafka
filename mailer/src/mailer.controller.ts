import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { MessagePattern } from '@nestjs/microservices';
import { IEmailData } from './interfaces/email-data.interfaces';
import { IMailSendResponse } from './interfaces/mail-send-response.interface';

@Injectable()
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @MessagePattern('mail_send')
  mailSend(data: IEmailData): IMailSendResponse {
    if (!this.configService.get('emailsDisabled')) {
      this.mailerService.sendMail(data);
    }
    return {
      status: HttpStatus.ACCEPTED,
      message: 'mail_send_success',
    };
  }
}
