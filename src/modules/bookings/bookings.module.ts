import { Module } from '@nestjs/common'
import { BookingService } from './bookings.service'
import { BookingsController } from './bookings.controller'
import { SeatService } from '../seat/seat.service'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { SeatsInCinemaHallService } from '../seats-in-cinema-hall/seats-in-cinema-hall.service'

@Module({
  controllers: [BookingsController],
  providers: [BookingService, SeatService, MovieSessionService, SeatsInCinemaHallService],
  exports: [BookingService],
})
export class BookingModule {}
