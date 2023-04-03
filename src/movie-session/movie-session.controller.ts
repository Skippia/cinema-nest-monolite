import { MovieSessionEntity } from './entity/MovieSessionEntity'
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseFilters,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { MovieSessionService } from './movie-session.service'
import { CreateMovieSessionDto } from './dto/create-movie-session.dto'
import { UpdateMovieSessionDto } from './dto/update-movie-session.dto'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'
import { Prisma } from '@prisma/client'
import { BadRequestDto } from '../utils/commonDtos/errors/bad-request.dto'
import { ConflictRequestDto } from '../utils/commonDtos/errors/conflict-request.dto'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'
import { MovieService } from '../movie/movie.service'
import { TIME_GAP_BETWEEN_MOVIE_SESSION, EXTRA_MOVIE_SESSION_TIME } from './movie-session.constants'
import { Serialize } from '../interceptors/serialize.interceptor'

@Controller('movies-sessions')
@ApiTags('Movies sessions')
@UseFilters(PrismaClientExceptionFilter)
export class MovieSessionController {
  constructor(
    private readonly movieSessionService: MovieSessionService,
    private readonly moviesInCinemaService: MoviesInCinemaService,
    private readonly movieService: MovieService,
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
    const { movieId, cinemaId, startDate, price } = dto
    /**
     * 1. Check if such movie is available for this cinema
     */

    const isMovieAvailableForCinema = await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    if (!isMovieAvailableForCinema) {
      throw new BadRequestException(`Movie with ${movieId} is not available for cinema with ${cinemaId}`)
    }

    /**
     * 2. End of movie session is calculated based on duration of movie + extra movie session time
     */

    const movie = await this.movieService.findOneMovie(movieId)

    if (!movie) {
      throw new NotFoundException(`Movie with ${movieId} is not found`)
    }

    const endDate = new Date(new Date(startDate).getTime() + movie.duration * 60000 + EXTRA_MOVIE_SESSION_TIME * 60000)

    /**
     * 3. Check if there is intersection with the session
     * in this cinema (at this time) ∈ [startDate, endDate]
     */
    const overlappingSession = await this.movieSessionService.findOverlappingMovieSession({
      startDate: new Date(startDate),
      endDate,
      cinemaId,
      timeGapBetweenMovieSession: TIME_GAP_BETWEEN_MOVIE_SESSION,
    })

    if (overlappingSession.length > 0) {
      throw new BadRequestException(`Cinema with ${cinemaId} already has a session `)
    }

    const newMovieSession = await this.movieSessionService.createMovieSession({
      startDate: new Date(startDate),
      movieId,
      cinemaId,
      endDate,
      price,
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
    const updadedMovieSession = await this.movieSessionService.updateMovieSession(movieSessionId, dto)

    return updadedMovieSession
  }

  @Delete(':movieSessionId')
  @ApiOperation({ description: 'Delete movie session by movieSessionId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieSessionEntity })
  @Serialize(MovieSessionEntity)
  async deleteMovieSession(@Param('movieSessionId', ParseIntPipe) movieSessionId: number): Promise<MovieSessionEntity> {
    const deletedMovieSession = await this.movieSessionService.deleteMovieSession(movieSessionId)

    return deletedMovieSession
  }

  @Delete('cinema/:cinemaId')
  @ApiOperation({ description: 'Delete all movies sessions for cinema by cinemaId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesSessions(@Param('cinemaId', ParseIntPipe) cinemaId: number): Promise<Prisma.BatchPayload> {
    const countDeletedMoviesSessionsFromCinema = await this.movieSessionService.resetMoviesSessions(cinemaId)

    return countDeletedMoviesSessionsFromCinema
  }
}
