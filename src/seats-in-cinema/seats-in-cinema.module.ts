import { Module } from '@nestjs/common'
import { SeatsInCinemaService } from './seats-in-cinema.service'
import { SeatsInCinemaController } from './seats-in-cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { SeatModule } from '../seat/seat.module'

@Module({
  controllers: [SeatsInCinemaController],
  providers: [SeatsInCinemaService],
  imports: [PrismaModule, SeatModule],
  exports: [SeatsInCinemaService],
})
export class SeatsInCinemaModule {}
