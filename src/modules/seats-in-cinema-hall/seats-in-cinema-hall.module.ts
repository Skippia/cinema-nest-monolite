import { Module } from '@nestjs/common'
import { SeatsInCinemaHallService } from './seats-in-cinema-hall.service'
// import { SeatsInCinemaHallController } from './seats-in-cinema-hall.controller'
import { SeatModule } from '../seat/seat.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  // controllers: [SeatsInCinemaHallController],
  providers: [SeatsInCinemaHallService],
  imports: [PrismaModule, SeatModule],
  exports: [SeatsInCinemaHallService],
})
export class SeatsInCinemaHallModule {}
