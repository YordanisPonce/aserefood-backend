import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import ResetPasswordTemplate from '../templates/auth/reset-password.template';
import ConfirmAccountTemplate from '../templates/auth/confirm-account.template';
import PendingOrderTemplate from '../templates/orders/pending-order.template';

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
  private readonly PENDING_ORDER: string =
    'Notificación de Orden Pendiente en Asere Food';
  private readonly PAID_ORDER: string =
    'Notificación de Orden Pagada en Asere Food';
  private readonly CANCELLED_EXPIRED_ORDER: string =
    'Notificación de Orden Expirada o Cancelada Manualmente en Asere Food';
  private readonly CANCELLED_WITHOUT_REFUND_ORDER: string =
    'Notificación de Orden Cancelada sin Reembolso en Asere Food';
  private readonly REFUNDED_ORDER: string =
    'Notificación de Orden Reembolso en Asere Food';

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

  async sendPendingOrderEmail(
    email: string,
    username: string,
    resetPasswordToken: string,
    orderId: number,
    totalPayment: number,
    currency: string,
    expirationHours: number,
    createdDate: Date,
  ): Promise<void> {
    const message = new PendingOrderTemplate({
      username,
      supportTeam: this.SUPPORT_TEAM,
      supportPhone: this.SUPPORT_PHONE,
      supportEmail: this.SUPPORT_EMAIL,
      orderId,
      expirationHours,
      currency,
      totalPayment,
      createdDate,
    }).getEmail();
    await this.sendMail(email, this.PENDING_ORDER, message);
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
      confirmAccountUrl: `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${confirmAccountToken}`,
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
