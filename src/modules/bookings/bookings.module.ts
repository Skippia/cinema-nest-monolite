import { Module } from '@nestjs/common'
import { BookingService } from './bookings.service'
import { BookingsController } from './bookings.controller'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { SeatService } from '../seat/seat.service'
import { SeatsInCinemaHallService } from '../seats-in-cinema-hall/seats-in-cinema-hall.service'

@Module({
  controllers: [BookingsController],
  providers: [BookingService, MovieSessionService, SeatsInCinemaHallService, SeatService],
})
export class BookingsModule {}
