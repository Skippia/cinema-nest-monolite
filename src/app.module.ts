import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { SeatModule } from './seat/seat.module'
import { MovieModule } from './movie/movie.module'
import { CinemaModule } from './cinema/cinema.module'
import { SeatsInCinemaModule } from './seats-in-cinema/seats-in-cinema.module'
import { MovieSessionModule } from './movie-session/movie-session.module'
import { ConfigModule } from '@nestjs/config'
import { MoviesInCinemaModule } from './movies-in-cinema/movies-in-cinema.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SeatModule,
    MovieModule,
    CinemaModule,
    SeatsInCinemaModule,
    MovieSessionModule,
    MoviesInCinemaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
