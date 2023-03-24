import { MovieService } from '../movie/movie.service'
import { Module } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import { MoviesInCinemaController } from './movies-in-cinema.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [MoviesInCinemaController],
  imports: [PrismaModule],
  providers: [MoviesInCinemaService, MovieService],
})
export class MoviesInCinemaModule {}
