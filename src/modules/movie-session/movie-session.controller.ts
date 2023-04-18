import {
  Controller,
  UseFilters,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Post,
  Body,
  BadRequestException,
  Patch,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { DeleteManyDto } from '../../common/dtos/common'
import { NotFoundResponseDto, BadRequestDto, ConflictRequestDto } from '../../common/dtos/errors'
import { Serialize } from '../../common/interceptors'
import { CinemaService } from '../cinema/cinema.service'
import { MovieService } from '../movie/movie.service'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { CreateMovieSessionDto, UpdateMovieSessionDto } from './dto'
import { MovieSessionEntity } from './entity'
import { EXTRA_MOVIE_SESSION_TIME, TIME_GAP_BETWEEN_MOVIE_SESSION } from './movie-session.constants'
import { MovieSessionService } from './movie-session.service'

@Controller('movies-sessions')
@ApiTags('Movies sessions')
@UseFilters(PrismaClientExceptionFilter)
export class MovieSessionController {
  constructor(
    private readonly movieSessionService: MovieSessionService,
    private readonly moviesInCinemaService: MoviesInCinemaService,
    private readonly movieService: MovieService,
    private readonly cinemaService: CinemaService,
  ) {}

  @Get()
  @ApiOperation({ description: 'Get all movies sessions' })
  @ApiOkResponse({ type: MovieSessionEntity, isArray: true })
  @Serialize(MovieSessionEntity)
  async findAllMovieSessions(): Promise<MovieSessionEntity[]> {
    const moviesSessions = await this.movieSessionService.findAllMovieSessions()

    return moviesSessions
  }

  @Get(':movieSessionId')
  @ApiOperation({ description: 'Get movie session by movieSessionId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieSessionEntity })
  @Serialize(MovieSessionEntity)
  async findOneMovieSession(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
  ): Promise<MovieSessionEntity> {
    const movieSession = await this.movieSessionService.findOneMovieSession(movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Could not find movie session with ${movieSessionId}.`)
    }

    return movieSession
  }

  @Post()
  @ApiOperation({ description: 'Create movie session' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictRequestDto })
  @ApiCreatedResponse({ type: MovieSessionEntity, isArray: true })
  @Serialize(MovieSessionEntity)
  async createMovieSession(@Body() dto: CreateMovieSessionDto): Promise<MovieSessionEntity> {
    const { movieId, cinemaHallId, startDate, price, currency, priceFactors } = dto

    const { id: cinemaId } = await this.cinemaService.findCinemaByCinemaHallId(cinemaHallId)

    //  1. Check if such movie is available for cinema (where is located this cinema hall)
    const isMovieAvailableForCinemaHall =
      await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    if (!isMovieAvailableForCinemaHall) {
      throw new BadRequestException(
        `Movie with ${movieId} is not available for cinema hall with ${cinemaHallId}`,
      )
    }

    //  2. End of movie session is calculated based on duration of movie + extra movie session time
    const movie = await this.movieService.findOneMovie(movieId)

    if (!movie) {
      throw new NotFoundException(`Movie with ${movieId} is not found`)
    }

    const endDate = new Date(
      new Date(startDate).getTime() + movie.duration * 60000 + EXTRA_MOVIE_SESSION_TIME * 60000,
    )

    /**
     * 3. Check if there is intersection with the session
     * in this cinema hall (at this time) ∈ [startDate, endDate]
     */
    const overlappingSession = await this.movieSessionService.findOverlappingMovieSession({
      startDate: new Date(startDate),
      endDate,
      cinemaHallId,
      timeGapBetweenMovieSession: TIME_GAP_BETWEEN_MOVIE_SESSION,
    })

    if (overlappingSession.length > 0) {
      throw new BadRequestException(
        `Cinema hall with ${cinemaHallId} already has a session at this time`,
      )
    }

    const newMovieSession = await this.movieSessionService.createMovieSession({
      startDate: new Date(startDate),
      movieId,
      cinemaHallId,
      endDate,
      price,
      currency,
      priceFactors,
    })

    return newMovieSession
  }

  @Patch(':movieSessionId')
  @ApiOperation({ description: 'Update movie session by movieSessionId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieSessionEntity })
  @Serialize(MovieSessionEntity)
  async updateMovieSession(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
    @Body() dto: UpdateMovieSessionDto,
  ): Promise<MovieSessionEntity> {
    const updadedMovieSession = await this.movieSessionService.updateMovieSession(
      movieSessionId,
      dto,
    )

    return updadedMovieSession
  }

  @Delete(':movieSessionId')
  @ApiOperation({ description: 'Delete movie session by movieSessionId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieSessionEntity })
  @Serialize(MovieSessionEntity)
  async deleteMovieSession(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
  ): Promise<MovieSessionEntity> {
    const deletedMovieSession = await this.movieSessionService.deleteMovieSession(movieSessionId)

    return deletedMovieSession
  }

  @Delete('cinema/:cinemaHallId')
  @ApiOperation({
    description: 'Delete all movies sessions for cinema hall by cinemaHallId',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesSessionsForHall(
    @Param('cinemaHallId', ParseIntPipe) cinemaHallId: number,
  ): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesSessionsFromCinema =
      await this.movieSessionService.resetMoviesSessionsForCinemaHall(cinemaHallId)

    return countDeletedMoviesSessionsFromCinema
  }
}
