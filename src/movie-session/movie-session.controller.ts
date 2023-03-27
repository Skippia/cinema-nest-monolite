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
import { FindMovieSessionDto } from './dto/find-movie-session.dto'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { MoviesInCinemaService } from '../movies-in-cinema/movies-in-cinema.service'
import { MovieSession, Prisma } from '@prisma/client'
import { BadRequestDto } from 'src/utils/commonDtos/errors/bad-request.dto'
import { ConflictRequestDto } from 'src/utils/commonDtos/errors/conflict-request.dto'
import { NotFoundResponseDto } from 'src/utils/commonDtos/errors/not-found-response.dto'

@Controller('movies-sessions')
@ApiTags('Movies sessions')
@UseFilters(PrismaClientExceptionFilter)
export class MovieSessionController {
  constructor(
    private readonly movieSessionService: MovieSessionService,
    private readonly moviesInCinemaService: MoviesInCinemaService,
  ) {}

  @Get()
  @ApiOperation({ description: 'Get all movies sessions' })
  @ApiOkResponse({ type: FindMovieSessionDto, isArray: true })
  async findAllMovieSessions(): Promise<MovieSession[]> {
    const moviesSessions = await this.movieSessionService.findAllMovieSessions()

    return moviesSessions
  }

  @Get(':movieSessionId')
  @ApiOperation({ description: 'Get movie session by movieSessionId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindMovieSessionDto })
  async findOneMovieSession(@Param('movieSessionId', ParseIntPipe) movieSessionId: number): Promise<MovieSession> {
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
  @ApiCreatedResponse({ type: FindMovieSessionDto, isArray: true })
  async createMovieSession(@Body() dto: CreateMovieSessionDto): Promise<MovieSession> {
    const { movieId, cinemaId } = dto

    const isMovieAvailableForCinema = await this.moviesInCinemaService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    if (!isMovieAvailableForCinema) {
      throw new BadRequestException(`Movie with ${movieId} is not available for cinema with ${cinemaId}`)
    }

    const newMovieSession = await this.movieSessionService.createMovieSession(dto)

    return newMovieSession
  }

  @Patch(':movieSessionId')
  @ApiOperation({ description: 'Update movie session by movieSessionId' })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindMovieSessionDto })
  async updateMovieSession(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
    @Body() dto: UpdateMovieSessionDto,
  ): Promise<MovieSession> {
    const updadedMovieSession = await this.movieSessionService.updateMovieSession(movieSessionId, dto)

    return updadedMovieSession
  }

  @Delete(':movieSessionId')
  @ApiOperation({ description: 'Delete movie session by movieSessionId' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindMovieSessionDto })
  async deleteMovieSession(@Param('movieSessionId', ParseIntPipe) movieSessionId: number): Promise<MovieSession> {
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
