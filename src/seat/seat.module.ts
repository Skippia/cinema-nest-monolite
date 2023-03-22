import { Module } from '@nestjs/common'
import { SeatService } from './seat.service'
import { SeatController } from './seat.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [SeatController],
  providers: [SeatService],
  imports: [PrismaModule],
})
export class SeatModule {}
