import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseFilters } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { FindMovieDto } from '../movie/dto/find-movie.dto'
import { Movie } from '../movie/dto/types'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { AddMovieToCinemaDto } from './dto/add-movie-to-cinema.dto'
import { MovieService } from '../movie/movie.service'

@Controller('movies-in-cinema')
@ApiTags('Movies in cinema')
@UseFilters(PrismaClientExceptionFilter)
export class MoviesInCinemaController {
  constructor(
    private readonly moviesInCinemaService: MoviesInCinemaService,
    private readonly movieService: MovieService,
  ) {}

  /**
   * MovieInCinema operations
   */

  @Post()
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async addMoviesToCinema(@Body() dto: AddMovieToCinemaDto): Promise<(Movie | undefined)[]> {
    const addedMoviesToCinema = await this.moviesInCinemaService.addMoviesToCinema(dto)

    const detailedAddedMoviesToCinema = await Promise.all(
      addedMoviesToCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )

    return detailedAddedMoviesToCinema
  }

  @Get(':cinemaId/:movieId')
  @ApiOkResponse({ type: Boolean })
  async checkIfMovieAvailableForCinema(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<boolean> {
    const isMovieAvailableForCinema = await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    return isMovieAvailableForCinema
  }

  @Get(':cinemaId')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async findMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<(Movie | undefined)[]> {
    const moviesInCinema = await this.moviesInCinemaService.findMoviesInCinema(cinemaId)

    const detailedMoviesInCinema = await Promise.all(
      moviesInCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )

    return detailedMoviesInCinema
  }

  @Delete(':cinemaId/:movieId')
  @ApiOkResponse({ type: FindMovieDto })
  async deleteMovieFromCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<Movie | undefined> {
    const deletedMovieFromCinema = await this.moviesInCinemaService.deleteMovieFromCinema(cinemaId, movieId)

    const detailedDeletedMovieFromCinema = await this.movieService.findOneMovie(deletedMovieFromCinema.movieId)

    return detailedDeletedMovieFromCinema
  }

  @Delete(':cinemaId')
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesFromCinema = await this.moviesInCinemaService.resetMoviesInCinema(cinemaId)

    return countDeletedMoviesFromCinema
  }
}
