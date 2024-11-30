import MailTemplate from '../mail.template';
import idFormatter from '../../../utils/formatters/id.formatter';
import dateFormatter from '../../../utils/formatters/date.formatter';

export default class PendingOrderTemplate extends MailTemplate<PendingOrderData> {
  getEmail(): string {
    return `
    <html lang="es">
    <body>
      <p>
        <strong>Estimado/a ${this.templateData.username},</strong>
      </p>
      <p>
        Según nuestros registros, usted tiene pendiente un pago asociado a la orden:</a>.
      </p>
      <br/>
      <ul>
        <li><strong>Número de la orden:</strong> ${idFormatter(this.templateData.orderId)}</li>
        <li><strong>Fecha de creación: </strong>${dateFormatter(this.templateData.createdDate)}</li>
        <li><strong>Total a pagar:</strong> ${this.templateData.totalPayment} ${this.templateData.currency}</li>
      </ul>
      <p>
       Le invitamos a ingresar a nuestra tienda y completar el proceso de pago en las próximas ${this.templateData.expirationHours} horas.
      </p>
      <p>
        Una vez confirmado su pago, recibirá un correo electrónico. Si su pago ya está en proceso, por favor ignore este mensaje.
        En caso de tener alguna duda puede comunicarse con nuestro equipo de soporte a través del correo electrónico <em>${this.templateData.supportEmail}</em> o al teléfono <em>${this.templateData.supportPhone}</em>
      </p>
      <p><strong>Atentamente</strong></p>
      <p><em>${this.templateData.supportTeam}</em></p>
    </body>
    </html>
    `;
  }
}

export interface PendingOrderData {
  username: string;
  orderId: number;
  createdDate: Date;
  totalPayment: number;
  currency: string;
  expirationHours: number;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}
