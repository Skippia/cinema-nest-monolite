import { Module } from '@nestjs/common'
import { SeatService } from './seat.service'
import { SeatController } from './seat.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [SeatController],
  providers: [SeatService],
  imports: [PrismaModule],
  exports: [SeatService],
})
export class SeatModule {}
