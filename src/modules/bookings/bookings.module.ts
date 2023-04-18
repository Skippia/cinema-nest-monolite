import { Module } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { BookingsController } from './bookings.controller'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { SeatService } from '../seat/seat.service'
import { PrismaModule } from '../prisma/prisma.module'
import { SeatsInCinemaHallModule } from '../seats-in-cinema-hall/seats-in-cinema-hall.module'

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, MovieSessionService, SeatService],
  imports: [PrismaModule, SeatsInCinemaHallModule],
})
export class BookingsModule {}
