import { Module } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { BookingsController } from './bookings.controller'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { SeatsInCinemaModule } from '../seats-in-cinema/seats-in-cinema.module'
import { SeatService } from '../seat/seat.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, MovieSessionService, SeatService],
  imports: [PrismaModule, SeatsInCinemaModule],
})
export class BookingsModule {}
