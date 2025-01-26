import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import ResetPasswordTemplate from '../templates/reset-password.template';
import ConfirmAccountTemplate from '../templates/confirm-account.template';

@Injectable()
export default class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(MailService.name);
  private readonly SUPPORT_TEAM = 'Asere Food Soporte';
  private readonly SUPPORT_EMAIL = 'soporte@aserefood.com';
  private readonly SUPPORT_PHONE = '0123456789';
  private readonly RESET_PASSWORD_SUBJECT: string =
    'Restablecer Contraseña en Asere Food';
  private readonly CONFIRM_ACCOUNT_SUBJECT: string =
    'Confirmar Cuenta en Asere Food';

  async sendResetPasswordEmail(
    email: string,
    username: string,
    resetPasswordToken: string,
  ): Promise<void> {
    const message = new ResetPasswordTemplate({
      username,
      supportTeam: this.SUPPORT_TEAM,
      supportPhone: this.SUPPORT_PHONE,
      supportEmail: this.SUPPORT_EMAIL,
      uiUrl: this.configService.get('UI_URL'),
      resetPasswordUrl: `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${resetPasswordToken}`,
    }).getEmail();
    await this.sendMail(email, this.RESET_PASSWORD_SUBJECT, message);
  }

  async sendConfirmAccountEmail(
    email: string,
    username: string,
    confirmAccountToken: string,
  ): Promise<void> {
    const message = new ConfirmAccountTemplate({
      username,
      supportTeam: this.SUPPORT_TEAM,
      supportPhone: this.SUPPORT_PHONE,
      supportEmail: this.SUPPORT_EMAIL,
      uiUrl: this.configService.get('UI_URL'),
      confirmAccountUrl: `${this.configService.get('EMAIL_CONFIRMATION_URL')}/${confirmAccountToken}`,
    }).getEmail();
    await this.sendMail(email, this.CONFIRM_ACCOUNT_SUBJECT, message);
  }

  private async sendMail(email: string, subject: string, message: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: {
          name: this.configService.get<string>('SENDER_NAME'),
          address: this.configService.get('SENDER_EMAIL'),
        },
        subject: subject,
        html: message,
        sender: {
          name: this.configService.get('SENDER_NAME'),
          address: this.configService.get('SENDER_EMAIL'),
        },
      });
      this.logger.log('Successfully sent email', email, subject);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.log('Failed to send email', email, subject);
      return {
        success: false,
      };
    }
  }
}
