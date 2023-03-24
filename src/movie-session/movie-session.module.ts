import { Module } from '@nestjs/common'
import { MovieSessionService } from './movie-session.service'
import { MovieSessionController } from './movie-session.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'

@Module({
  controllers: [MovieSessionController],
  providers: [MovieSessionService, MoviesInCinemaService],
  imports: [PrismaModule],
})
export class MovieSessionModule {}
