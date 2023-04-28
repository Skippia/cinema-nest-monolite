import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthGoogleModule } from './modules/auth-google/auth-google.module'
import { AuthJwtModule } from './modules/auth-jwt/auth-jwt.module'
import { CinemaModule } from './modules/cinema/cinema.module'
import { MovieReviewsModule } from './modules/movie-reviews/movie-reviews.module'
import { MovieSessionModule } from './modules/movie-session/movie-session.module'
import { MovieModule } from './modules/movie/movie.module'
import { MoviesInCinemaModule } from './modules/movies-in-cinema/movies-in-cinema.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { SeatModule } from './modules/seat/seat.module'
import { UsersModule } from './modules/users/users.module'
import { AuthGithubModule } from './modules/auth-github/auth-github.module'
import { SeatsInCinemaHallModule } from './modules/seats-in-cinema-hall/seats-in-cinema-hall.module'
import { CinemaHallModule } from './modules/cinema-hall/cinema-hall.module'
import { BookingModule } from './modules/bookings/bookings.module'
import { S3Module } from './modules/s3/s3.module'
import { AccessControlModule } from 'nest-access-control'
import { RBAC_POLICY } from './modules/auth-jwt/rbac-policy'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AccessControlModule.forRoles(RBAC_POLICY),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SeatModule,
    MovieModule,
    CinemaModule,
    SeatsInCinemaHallModule,
    MovieSessionModule,
    MoviesInCinemaModule,
    MovieReviewsModule,
    BookingModule,
    AuthJwtModule,
    AuthGoogleModule,
    UsersModule,
    AuthGithubModule,
    CinemaHallModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
