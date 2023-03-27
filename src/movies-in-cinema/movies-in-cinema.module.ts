import { MovieService } from '../movie/movie.service'
import { Module } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import { MoviesInCinemaController } from './movies-in-cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { CinemaService } from 'src/cinema/cinema.service'

@Module({
  controllers: [MoviesInCinemaController],
  imports: [PrismaModule],
  providers: [MoviesInCinemaService, MovieService, CinemaService],
})
export class MoviesInCinemaModule {}
