import idFormatter from '../../../utils/formatters/id.formatter';
import dateFormatter from '../../../utils/formatters/date.formatter';
import MailTemplate from '../mail.template';

export default class PaidOrderTemplate extends MailTemplate<PaidOrderData> {
  getEmail(): string {
    return `
    <html lang="es">
    <body>
      <p>
        <strong>Estimado/a ${this.templateData.username},</strong>
      </p>
      <p>
        Según nuestros registros, su orden ha sido pagada exitosamente:
      </p>
      <ul>
        <li><strong>Número de la orden:</strong> ${idFormatter(this.templateData.orderId)}</li>
        <li><strong>Fecha de creación: </strong>${dateFormatter(this.templateData.createdDate)}</li>
        <li><strong>Total a pagar:</strong> ${this.templateData.totalPayment} ${this.templateData.currency}</li>
        <li><strong>El pago de esta orden será reflejado en su estado de cuenta bancaria como: </strong> ${this.templateData.statement}</li>
      </ul>
      <p>Detalles de entrega a domicilio/o recogida:</p>
      <ul>
        <li><strong>Nombre:</strong> ${this.templateData.username}</li>
        <li><strong>Dirección de Entrega: </strong>${this.templateData.deliveryLocation}</li>
        <li><strong>Teléfono de Contacto:</strong> ${this.templateData.contactPhoneNumber}</li>
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

export interface PaidOrderData {
  username: string;
  orderId: number;
  statement: string;
  createdDate: Date;
  deliveryLocation: string;
  contactPhoneNumber: string;
  totalPayment: number;
  currency: string;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}
