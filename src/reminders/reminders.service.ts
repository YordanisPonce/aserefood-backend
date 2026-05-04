import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Order from '../database/entities/order.entity';
import { OrderStatus } from '../database/entities/constants';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  @Cron('45 11 * * *')
  async checkPendingOrders() {
    this.logger.log('🔍 Revisando órdenes pendientes...');
    
    try {
      const pendingOrders = await this.orderRepository.find({
        where: { status: OrderStatus.PAYMENT_PENDING },
        relations: ['user', 'orderItems', 'orderItems.product'],
        order: { createdDate: 'ASC' },
      });
      
      const count = pendingOrders.length;
      
      if (count === 0) {
        this.logger.log('✅ No hay órdenes pendientes');
        return;
      }
      
      this.logger.log(`📋 Encontradas ${count} órdenes pendientes`);
      await this.sendReminderEmail(pendingOrders);
      
    } catch (error) {
      this.logger.error('Error al revisar órdenes pendientes:', error);
    }
  }
  
  private async sendReminderEmail(orders: Order[]) {
    const ownerEmail = process.env.OWNER_EMAIL;
    const count = orders.length;
    const totalGeneral = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    
    const ordersListHtml = orders.map(order => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">#${order.id}</td>
        <td style="padding: 8px;">${order.user?.username || order.user?.email || 'Cliente'}</td>
        <td style="padding: 8px;">${order.orderItems?.length || 0} productos</td>
        <td style="padding: 8px; text-align: right;">$${Number(order.totalAmount).toFixed(2)}</td>
        <td style="padding: 8px;">${new Date(order.createdDate).toLocaleDateString()}</td>
      </tr>
    `).join('');
    
    const detallesOrdenes = orders.map(order => {
      const productos = order.orderItems?.map(item => 
        `&nbsp;&nbsp;&nbsp;- ${item.product?.name || 'Producto'}: ${item.amount} unidades`
      ).join('<br>') || '&nbsp;&nbsp;&nbsp;- Sin productos';
      
      return `
        <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-left: 3px solid #d32f2f;">
          <strong>Pedido #${order.id}</strong> - Cliente: ${order.user?.username || 'N/A'} - Total: $${Number(order.totalAmount).toFixed(2)}<br>
          <small>Productos:<br>${productos}</small>
        </div>
      `;
    }).join('');
    
    const htmlMessage = `
      <html>
      <head>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #f2f2f2; padding: 10px; text-align: left; }
          td { padding: 8px; }
          .total { font-size: 18px; font-weight: bold; color: #d32f2f; }
        </style>
      </head>
      <body>
        <h2 style="color: #d32f2f;">⚠️ ALERTA: ${count} Órdenes Pendientes</h2>
        
        <p>Tienes <strong>${count}</strong> órdenes esperando por atención:</p>
        
        <table style="width: 100%; border: 1px solid #ddd;">
          <thead>
            <tr><th>ID</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${ordersListHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f2f2f2;">
              <td colspan="3" style="text-align: right;"><strong>Total General:</strong></td>
              <td colspan="2" class="total">$${totalGeneral.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>📦 Detalle de productos por orden:</h3>
        ${detallesOrdenes}
        
        <p style="margin-top: 20px;">
          📍 <strong>Acciones recomendadas:</strong>
          <ul>
            <li>Ingresa al sistema para gestionar estas órdenes</li>
            <li>Prioriza las órdenes más antiguas</li>
            <li>Contacta a los clientes si es necesario</li>
          </ul>
        </p>
        
        <hr>
        <small>
          Este es un correo automático de Asere Food.<br>
          ${new Date().toLocaleString()}
        </small>
      </body>
      </html>
    `;
    
    await this.sendDirectEmail(ownerEmail, `⚠️ ${count} órdenes pendientes - Total: $${totalGeneral.toFixed(2)}`, htmlMessage);
  }
  
  private async sendDirectEmail(to: string, subject: string, html: string) {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    
    const info = await transporter.sendMail({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });
    
    this.logger.log(`✅ Correo enviado a ${to}`);
    this.logger.log(`📧 ID del mensaje: ${info.messageId}`);
  }
}