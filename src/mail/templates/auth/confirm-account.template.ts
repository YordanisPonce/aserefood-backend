import MailTemplate from '../mail.template';

export default class ConfirmAccountTemplate extends MailTemplate<ConfirmAccountData> {
  getEmail(): string {
    return `
    <html lang="es">
    <body>
      <p>
        <strong>Estimado/a ${this.templateData.username},</strong>
      </p>
      <p>
        Según nuestros registros, usted ha sido registrado en la plataforma <a href="${this.templateData.uiUrl}"><strong>Asere Food</strong></a>.
      </p>
      <p>
        Para usar su cuenta debe confirmarla accediendo <a href="${this.templateData.confirmAccountUrl}"><strong>al siguiente enlace</strong></a>.
      </p>
      <p>
        Si usted no creó esta cuenta puedo obviar este mensaje. En caso de tener alguna duda puede comunicarse con nuestro equipo de soporte a través del correo electrónico <em>${this.templateData.supportEmail}</em> o al teléfono <em>${this.templateData.supportPhone}</em>
      </p>
      <p><strong>Atentamente</strong></p>
      <p><em>${this.templateData.supportTeam}</em></p>
    </body>
    </html>
    `;
  }
}

export interface ConfirmAccountData {
  username: string;
  uiUrl: string;
  confirmAccountUrl: string;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}
