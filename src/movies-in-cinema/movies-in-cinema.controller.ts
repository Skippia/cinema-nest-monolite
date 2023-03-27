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
import { FindMovieDto } from '../movie/dto/find-movie.dto'
import { Movie } from '../movie/dto/types'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { AddMovieToCinemaDto } from './dto/add-movie-to-cinema.dto'
import { MovieService } from '../movie/movie.service'
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
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async addMoviesToCinema(@Body() dto: AddMovieToCinemaDto): Promise<(Movie | undefined)[]> {
    const addedMoviesToCinema = await this.moviesInCinemaService.addMoviesToCinema(dto)

    const detailedAddedMoviesToCinema = await Promise.all(
      addedMoviesToCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )

    return detailedAddedMoviesToCinema
  }

  @Get(':cinemaId/:movieId')
  @ApiOperation({ description: 'Get if movie (by movieId) is available for cinema (by cinemaId)' })
  @ApiOkResponse({ type: Boolean })
  async checkIfMovieAvailableForCinema(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<boolean> {
    const isMovieAvailableForCinema = await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    return isMovieAvailableForCinema
  }

  @Get(':cinemaId')
  @ApiOperation({ description: 'Get all available movies for cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async findMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<(Movie | undefined)[]> {
    const cinema = await this.cinemaService.findOneCinema(cinemaId)

    if (!cinema) {
      throw new NotFoundException(`Could not find cinema with ${cinemaId}.`)
    }

    const moviesInCinema = await this.moviesInCinemaService.findMoviesInCinema(cinemaId)

    const detailedMoviesInCinema = await Promise.all(
      moviesInCinema.map((m) => this.movieService.findOneMovie(m.movieId)),
    )

    return detailedMoviesInCinema
  }

  @Delete(':cinemaId/:movieId')
  @ApiOperation({ description: 'Delete movie (by movieId) from cinema (by cinemaId)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
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
  @ApiOperation({ description: 'Delete all movies from cinema (by cinemaId)' })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesFromCinema = await this.moviesInCinemaService.resetMoviesInCinema(cinemaId)

    return countDeletedMoviesFromCinema
  }
}
