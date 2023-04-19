import { Module } from '@nestjs/common'
import { SeatsInCinemaHallService } from './seats-in-cinema-hall.service'
import { SeatService } from '../seat/seat.service'

@Module({
  providers: [SeatsInCinemaHallService, SeatService],
  exports: [SeatsInCinemaHallService],
})
export class SeatsInCinemaHallModule {}
