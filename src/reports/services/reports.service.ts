import PgService from '../../database/services/pg.service';
import { Injectable } from '@nestjs/common';
import { Between, In, IsNull, Not } from 'typeorm';
import MostDemandedItemOutDto from '../dto/out/most-demanded-item.out.dto';
import OrderItems from '../../database/entities/order-item.entity';
import SaleOutDto, { SaleDetailOutDto } from '../dto/out/sale.out.dto';
import {
  eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek, endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek, startOfYear,
} from 'date-fns';
import { OrderStatus } from '../../database/entities/constants';

@Injectable()
export default class ReportsService {
  constructor(
    private readonly pgService: PgService
  ) {}

  async mostDemandedProducts(
    startDate?: Date,
    endDate?: Date,
    amount: number = 7,
  ): Promise<MostDemandedItemOutDto[]> {
    let orders = await this.pgService.orders.find({
      where: { orderItems: { productId: Not(IsNull()) } },
      relations: ['orderItems', 'orderItems.product'],
    });
    if (startDate) orders = orders.filter((x) => x.updatedDate >= startDate);
    if (endDate) orders = orders.filter((x) => x.updatedDate <= endDate);
    const orderItems: OrderItems[] = orders.flatMap(order => order.orderItems);

    const productQuantities = orderItems.reduce((acc, item) => {
      if (!item.productId || !item.product) return acc;

      const key = item.productId;
      acc[key] = {
        name: item.product.name,
        quantity: (acc[key]?.quantity || 0) + item.amount
      };
      return acc;
    }, {} as Record<number, { name: string; quantity: number }>);

    return Object.values(productQuantities)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, amount)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
      }));
  }

  async mostDemandedProductCombos(
    startDate?: Date,
    endDate?: Date,
    amount: number = 7,
  ): Promise<MostDemandedItemOutDto[]> {
    let orders = await this.pgService.orders.find({
      where: { orderItems: { productComboId: Not(IsNull()) } },
      relations: ['orderItems', 'orderItems.productCombo'],
    });
    if (startDate) orders = orders.filter((x) => x.updatedDate >= startDate);
    if (endDate) orders = orders.filter((x) => x.updatedDate <= endDate);
    const orderItems: OrderItems[] = orders.flatMap(order => order.orderItems);

    const productComboQuantities = orderItems.reduce((acc, item) => {
      if (!item.productComboId || !item.productCombo) return acc;

      const key = item.productComboId;
      acc[key] = {
        name: item.productCombo.name,
        quantity: (acc[key]?.quantity || 0) + item.amount
      };
      return acc;
    }, {} as Record<number, { name: string; quantity: number }>);

    return Object.values(productComboQuantities)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, amount)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
      }));
  }

  async salesCurrentDay(): Promise<SaleOutDto> {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);

    const orders = await this.pgService.orders.find({
      where: {
        updatedDate: Between(startOfToday, endOfToday),
        status: In([OrderStatus.PAYED, OrderStatus.DELIVERED])
      },
      relations: ['orderItems']
    });

    const sales: SaleDetailOutDto[] = []

    orders.forEach(order => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.amount * Number(item.price || 0));
      }, 0);
      const roundedTotal = Number(orderTotal.toFixed(2));
      sales.push({
        date: order.updatedDate,
        amount: roundedTotal
      })
    })

    return {
      sales,
      total: sales.reduce((sum, item) => sum + item.amount, 0),
    }
  }

  async salesCurrentWeek(): Promise<SaleOutDto> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const orders = await this.pgService.orders.find({
      where: {
        updatedDate: Between(weekStart, weekEnd),
        status: In([OrderStatus.PAYED, OrderStatus.DELIVERED])
      },
      relations: ['orderItems']
    });

    const dailySalesMap: { [key: string]: number } = {};
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    daysInWeek.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      dailySalesMap[key] = 0;
    });

    let totalSales = 0;

    orders.forEach(order => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.amount * Number(item.price || 0));
      }, 0);

      const roundedTotal = Number(orderTotal.toFixed(2));

      const dayKey = format(order.updatedDate, 'yyyy-MM-dd');

      if (dailySalesMap.hasOwnProperty(dayKey)) {
        dailySalesMap[dayKey] += roundedTotal;
        totalSales += roundedTotal;
      }
    });

    const salesArray: SaleDetailOutDto[] = daysInWeek.map(day => ({
      date: day,
      amount: dailySalesMap[format(day, 'yyyy-MM-dd')]
    }));

    return {
      sales: salesArray,
      total: Number(totalSales.toFixed(2))
    };
  }

  async salesCurrentMonth(): Promise<SaleOutDto> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const weeksInMonth = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 } // Lunes
    );

    const orders = await this.pgService.orders.find({
      where: {
        updatedDate: Between(monthStart, monthEnd),
        status: In([OrderStatus.PAYED, OrderStatus.DELIVERED])
      },
      relations: ['orderItems']
    });

    const weeklySalesMap: { [key: string]: number } = {};
    weeksInMonth.forEach(weekStartDay => {
      const key = format(weekStartDay, 'yyyy-MM-dd');
      weeklySalesMap[key] = 0;
    });

    let totalSales = 0;

    orders.forEach(order => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.amount * Number(item.price || 0));
      }, 0);

      const roundedTotal = Number(orderTotal.toFixed(2));

      const weekStartDay = startOfWeek(order.updatedDate, { weekStartsOn: 1 });
      const weekKey = format(weekStartDay, 'yyyy-MM-dd');

      if (weeklySalesMap.hasOwnProperty(weekKey)) {
        weeklySalesMap[weekKey] += roundedTotal;
        totalSales += roundedTotal;
      }
    });

    const salesArray: SaleDetailOutDto[] = weeksInMonth.map(weekStartDay => {
      const weekKey = format(weekStartDay, 'yyyy-MM-dd');
      return {
        date: weekStartDay,
        amount: weeklySalesMap[weekKey]
      };
    });

    return {
      sales: salesArray,
      total: Number(totalSales.toFixed(2))
    }
  }

  async salesCurrentYear(): Promise<SaleOutDto> {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const orders = await this.pgService.orders.find({
      where: {
        updatedDate: Between(yearStart, yearEnd),
        status: In([OrderStatus.PAYED, OrderStatus.DELIVERED])
      },
      relations: ['orderItems']
    });

    const monthlySalesMap: { [key: string]: number } = {};

    monthsInYear.forEach(monthStartDay => {
      const key = format(monthStartDay, 'yyyy-MM');
      monthlySalesMap[key] = 0;
    });

    let totalSales = 0;

    orders.forEach(order => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.amount * Number(item.price || 0));
      }, 0);

      const roundedTotal = Number(orderTotal.toFixed(2));
      const monthKey = format(order.updatedDate, 'yyyy-MM');

      if (monthlySalesMap.hasOwnProperty(monthKey)) {
        monthlySalesMap[monthKey] += roundedTotal;
        totalSales += roundedTotal;
      }
    });

    const salesArray: SaleDetailOutDto[] = monthsInYear.map(monthStartDay => {
      const monthKey = format(monthStartDay, 'yyyy-MM');
      return {
        date: monthStartDay,
        amount: monthlySalesMap[monthKey]
      };
    });

    return {
      sales: salesArray,
      total: Number(totalSales.toFixed(2))
    };
  }
}
