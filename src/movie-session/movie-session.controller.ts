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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { FindMovieSessionDto } from './dto/find-movie-session.dto'
import { DeleteManyDto } from 'src/utils/commonDtos/delete-many.dto'
import { PrismaClientExceptionFilter } from 'src/prisma/prisma-client-exception'
import { MovieService } from 'src/movie/movie.service'

@Controller('movies-sessions')
@ApiTags('Movies sessions')
@UseFilters(PrismaClientExceptionFilter)
export class MovieSessionController {
  constructor(private readonly movieSessionService: MovieSessionService, private readonly movieService: MovieService) {}

  @Get()
  @ApiOkResponse({ type: FindMovieSessionDto, isArray: true })
  async findAllMovieSessions() {
    const moviesSessions = await this.movieSessionService.findAllMovieSessions()
    return moviesSessions
  }

  @Get(':movieSessionId')
  @ApiOkResponse({ type: FindMovieSessionDto })
  async findOneMovieSession(@Param('movieSessionId', ParseIntPipe) movieSessionId: number) {
    const movieSession = await this.movieSessionService.findOneMovieSession(movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Could not find movie session with ${movieSessionId}.`)
    }

    return movieSession
  }

  @Post()
  @ApiCreatedResponse({ type: FindMovieSessionDto, isArray: true })
  async createMovieSession(@Body() dto: CreateMovieSessionDto) {
    const { movieId, cinemaId } = dto

    const isMovieAvailableForCinema = await this.movieService.checkIfMovieAvailableForCinema(movieId, cinemaId)

    if (!isMovieAvailableForCinema) {
      throw new BadRequestException(`Movie with ${movieId} is not available for cinema with ${cinemaId}`)
    }

    const newMovieSession = await this.movieSessionService.createMovieSession(dto)
    return newMovieSession
  }

  @Patch(':movieSessionId')
  @ApiOkResponse({ type: FindMovieSessionDto })
  async updateMovieSession(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
    @Body() dto: UpdateMovieSessionDto,
  ) {
    const updadedMovieSession = await this.movieSessionService.updateMovieSession(movieSessionId, dto)
    return updadedMovieSession
  }

  @Delete(':movieSessionId')
  @ApiOkResponse({ type: FindMovieSessionDto })
  async removeMovieSession(@Param('movieSessionId', ParseIntPipe) movieSessionId: number) {
    const removedMovieSession = await this.movieSessionService.removeMovieSession(movieSessionId)
    return removedMovieSession
  }

  @Delete(':cinemaId')
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesSessions(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    const countDeletedMoviesSessionsFromCinema = await this.movieSessionService.resetMoviesSessions(cinemaId)
    return countDeletedMoviesSessionsFromCinema
  }
}
