import { Module } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import { MoviesInCinemaController } from './movies-in-cinema.controller'
import { CinemaService } from '../cinema/cinema.service'
import { MovieService } from '../movie/movie.service'

@Module({
  controllers: [MoviesInCinemaController],
  providers: [MoviesInCinemaService, MovieService, CinemaService],
})
export class MoviesInCinemaModule {}
