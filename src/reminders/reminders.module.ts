import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import Order from '../database/entities/order.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Order]),
  ],
  providers: [RemindersService],
})
export class RemindersModule {}