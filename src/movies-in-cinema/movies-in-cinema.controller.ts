import { Serialize } from '../interceptors/serialize.interceptor'
import { MovieEntity } from './../movie/entity/MovieEntity'
import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseFilters, NotFoundException } from '@nestjs/common'
import { MoviesInCinemaService } from './movies-in-cinema.service'
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Movie } from '../movie/utils/types'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { AddMovieToCinemaDto } from './dto/add-movie-to-cinema.dto'
import { MovieService } from '../movie/movie.service'
import { MovieIsAvailableForCinemaDto } from './dto/movie-is-available-for-cinema.dto'
import { BadRequestDto } from '../utils/commonDtos/errors/bad-request.dto'
import { ConflictRequestDto } from '../utils/commonDtos/errors/conflict-request.dto'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'
import { CinemaService } from '../cinema/cinema.service'

@Controller('movies-in-cinema')
@ApiTags('Movies in cinema')
@UseFilters(PrismaClientExceptionFilter)
export class MoviesInCinemaController {
  constructor(
    private readonly moviesInCinemaService: MoviesInCinemaService,
    private readonly movieService: MovieService,
    private readonly cinemaService: CinemaService,
  ) {}

  @Post()
  @ApiOperation({ description: 'Add movies (by movieId-s) to cinema by cinemaId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: MovieEntity, isArray: true })
  @Serialize(MovieEntity)
  async addMoviesToCinema(@Body() dto: AddMovieToCinemaDto): Promise<(Movie | undefined)[]> {
    const addedMoviesToCinema = await this.moviesInCinemaService.addMoviesToCinema(dto)

    const detailedAddedMoviesToCinema = (await Promise.all(
      addedMoviesToCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )) as Movie[]

    return detailedAddedMoviesToCinema
  }

  @Get(':cinemaId/:movieId')
  @ApiOperation({ description: 'Get if movie (by movieId) is available for cinema (by cinemaId)' })
  @ApiOkResponse({ type: MovieIsAvailableForCinemaDto })
  async checkIfMovieAvailableForCinema(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<{ isAvailable: boolean }> {
    const isMovieAvailableForCinema = await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    return { isAvailable: isMovieAvailableForCinema }
  }

  @Get(':cinemaId')
  @ApiOperation({ description: 'Get all available movies for cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiCreatedResponse({ type: MovieEntity, isArray: true })
  @Serialize(MovieEntity)
  async findMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<(MovieEntity | undefined)[]> {
    const cinema = await this.cinemaService.findOneCinema(cinemaId)

    if (!cinema) {
      throw new NotFoundException(`Could not find cinema with ${cinemaId}.`)
    }

    const moviesInCinema = await this.moviesInCinemaService.findMoviesInCinema(cinemaId)

    const detailedMoviesInCinema = (await Promise.all(
      moviesInCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )) as Movie[]

    return detailedMoviesInCinema
  }

  @Delete(':cinemaId/:movieId')
  @ApiOperation({ description: 'Delete movie (by movieId) from cinema (by cinemaId)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieEntity })
  @Serialize(MovieEntity)
  async deleteMovieFromCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<MovieEntity> {
    const deletedMovieFromCinema = await this.moviesInCinemaService.deleteMovieFromCinema(cinemaId, movieId)

    const detailedDeletedMovieFromCinema = await this.movieService.findOneMovie(deletedMovieFromCinema.movieId)

    if (!detailedDeletedMovieFromCinema) {
      throw new NotFoundException(`Movie with id = ${movieId} not found for cinema = ${cinemaId}`)
    }

    return detailedDeletedMovieFromCinema
  }

  @Delete(':cinemaId')
  @ApiOperation({ description: 'Delete all movies from cinema (by cinemaId)' })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesFromCinema = await this.moviesInCinemaService.resetMoviesInCinema(cinemaId)

    return countDeletedMoviesFromCinema
  }
}
