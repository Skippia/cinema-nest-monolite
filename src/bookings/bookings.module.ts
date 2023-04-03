import { Module } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { BookingsController } from './bookings.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { SeatsInCinemaModule } from '../seats-in-cinema/seats-in-cinema.module'
import { SeatService } from '../seat/seat.service'

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, MovieSessionService, SeatService],
  imports: [PrismaModule, SeatsInCinemaModule],
})
export class BookingsModule {}
