import { Module } from '@nestjs/common'
import { MovieSessionService } from './movie-session.service'
import { MovieSessionController } from './movie-session.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'
import { MovieService } from '../movie/movie.service'
import { CinemaModule } from '../cinema/cinema.module'

@Module({
  controllers: [MovieSessionController],
  providers: [MovieSessionService, MoviesInCinemaService, MovieService],
  imports: [PrismaModule, CinemaModule],
})
export class MovieSessionModule {}
