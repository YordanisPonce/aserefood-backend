import MailTemplate from '../mail.template';
import idFormatter from '../../../utils/formatters/id.formatter';

export default class CancelledOrderTemplate extends MailTemplate<CancelledOrderData>{
  getEmail(): string {
    return `
    <html lang="es">
    <body>
      <p>
        <strong>Estimado/a ${this.templateData.username},</strong>
      </p>
      <p>
        Según nuestros registros, su orden ha sido cancelada por: ${this.templateData.cancellationReason}
      </p>
      <ul>
        <li><strong>Número de la orden:</strong> ${idFormatter(this.templateData.orderId)}</li>
      </ul>
      <p> 
        En caso de tener alguna duda puede comunicarse con nuestro equipo de soporte a través del correo electrónico <em>${this.templateData.supportEmail}</em> o al teléfono <em>${this.templateData.supportPhone}</em>
      </p>
      <p><strong>Atentamente</strong></p>
      <p><em>${this.templateData.supportTeam}</em></p>
    </body>
    </html>
    `;
  }
}

export interface CancelledOrderData {
  username: string;
  cancellationReason: string;
  orderId: number;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}