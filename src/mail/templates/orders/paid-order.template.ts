export default class PaidOrderTemplate {}

export interface PaidOrderData {
  username: string;
  orderId: number;
  statement: string;
  createdDate: Date;
  totalPayment: number;
  currency: string;
  expirationHours: number;
  supportTeam: string;
  supportPhone: string;
  supportEmail: string;
}
