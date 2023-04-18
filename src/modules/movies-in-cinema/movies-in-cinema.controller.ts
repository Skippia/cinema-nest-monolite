import {
  Controller,
  UseFilters,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { DeleteManyDto } from 'src/common/dtos/common'
import { BadRequestDto, ConflictRequestDto, NotFoundResponseDto } from 'src/common/dtos/errors'
import { Serialize } from 'src/common/interceptors'
import { CinemaService } from '../cinema/cinema.service'
import { MovieEntity } from '../movie/entity'
import { MovieService } from '../movie/movie.service'
import { Movie } from '../movie/types'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { AddMovieToCinemaDto, MovieIsAvailableForCinemaDto } from './dto'
import { MoviesInCinemaService } from './movies-in-cinema.service'

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
  @ApiOperation({
    description: 'Add movies (by movieId-s) to cinema by cinemaId',
  })
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
  @ApiOperation({
    description: 'Get if movie (by movieId) is available for cinema (by cinemaId)',
  })
  @ApiOkResponse({ type: MovieIsAvailableForCinemaDto })
  async checkIfMovieAvailableForCinema(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<{ isAvailable: boolean }> {
    const isMovieAvailableForCinema =
      await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    return { isAvailable: isMovieAvailableForCinema }
  }

  @Get(':cinemaId')
  @ApiOperation({
    description: 'Get all available movies for cinema by cinemaId',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiCreatedResponse({ type: MovieEntity, isArray: true })
  @Serialize(MovieEntity)
  async findMoviesInCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<(MovieEntity | undefined)[]> {
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
  @ApiOperation({
    description: 'Delete movie (by movieId) from cinema (by cinemaId)',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieEntity })
  @Serialize(MovieEntity)
  async deleteMovieFromCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<MovieEntity> {
    const deletedMovieFromCinema = await this.moviesInCinemaService.deleteMovieFromCinema(
      cinemaId,
      movieId,
    )

    const detailedDeletedMovieFromCinema = await this.movieService.findOneMovie(
      deletedMovieFromCinema.movieId,
    )

    if (!detailedDeletedMovieFromCinema) {
      throw new NotFoundException(`Movie with id = ${movieId} not found for cinema = ${cinemaId}`)
    }

    return detailedDeletedMovieFromCinema
  }

  @Delete(':cinemaId')
  @ApiOperation({ description: 'Delete all movies from cinema (by cinemaId)' })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesInCinema(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesFromCinema = await this.moviesInCinemaService.resetMoviesInCinema(
      cinemaId,
    )

    return countDeletedMoviesFromCinema
  }
}
