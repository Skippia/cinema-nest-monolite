import { Module } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import { MoviesInCinemaController } from './movies-in-cinema.controller'
import { CinemaService } from '../cinema/cinema.service'
import { MovieService } from '../movie/movie.service'
import { S3Module } from '../s3/s3.module'

@Module({
  controllers: [MoviesInCinemaController],
  providers: [MoviesInCinemaService, MovieService, CinemaService],
  imports: [S3Module],
})
export class MoviesInCinemaModule {}
