import { Module } from '@nestjs/common'
import { MovieSessionService } from './movie-session.service'
import { MovieSessionController } from './movie-session.controller'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'
import { MovieService } from '../movie/movie.service'
import { CinemaService } from '../cinema/cinema.service'

@Module({
  controllers: [MovieSessionController],
  providers: [MovieSessionService, MoviesInCinemaService, MovieService, CinemaService],
  exports: [MovieSessionService],
})
export class MovieSessionModule {}
