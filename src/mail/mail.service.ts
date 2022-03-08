import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, newPassword: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Archimedes! Your Password has been reset!',
      template: 'src/mail/templates/passwordChangedTemplate.hbs',
      context: {
        name: user.name,
        newPassword: newPassword,
      },
    });
  }
}
