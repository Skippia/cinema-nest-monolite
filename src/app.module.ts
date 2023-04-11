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
import { MovieReviewsModule } from './movie-reviews/movie-reviews.module'
import { BookingsModule } from './bookings/bookings.module'
import { APP_GUARD } from '@nestjs/core'
import { AuthGoogleModule } from './auth-google/auth-google.module'
import { UsersModule } from './users/users.module'
import { AuthJwtModule } from './auth-jwt/auth-jwt.module'
import { AtGuard } from './auth-jwt/guards'

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
    MovieReviewsModule,
    BookingsModule,
    AuthJwtModule,
    AuthGoogleModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
