import MailTemplate from '../mail.template';

export default class ResetPasswordTemplate extends MailTemplate<ResetPasswordData> {
  getEmail(): string {
    return `
    <html lang="es">
    <body>
      <p>
        <strong>Estimado/a ${this.templateData.username},</strong>
      </p>
      <p>
        Según nuestros registros, usted olvidó su contraseña en la plataforma <a href="${this.templateData.uiUrl}"><strong>Asere Food</strong></a>.
      </p>
      <p>
        Para restablecer su contraseña, acceda a <a href="${this.templateData.resetPasswordUrl}"><strong>al siguiente enlace</strong></a> en las próximas 24 horas.
      </p>
      <p>
        Si usted no solicitó este servicio puedo obviar este mensaje. En caso de tener alguna duda puede comunicarse con nuestro equipo de soporte a través del correo electrónico <em>${this.templateData.supportEmail}</em> o al teléfono <em>${this.templateData.supportPhone}</em>
      </p>
      <p><strong>Atentamente</strong></p>
      <p><em>${this.templateData.supportTeam}</em></p>
    </body>
    </html>
    `;
  }
}

export interface ResetPasswordData {
  username: string;
  uiUrl: string;
  resetPasswordUrl: string;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}
