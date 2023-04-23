import { Controller, UseFilters, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { NotFoundResponseDto } from '../../common/dtos/errors'
import { Serialize } from '../../common/interceptors'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { MovieEntity } from './entity'
import { MovieService } from './movie.service'
import { GetMovieQuery } from './decorators'

@Controller('movies')
@ApiTags('Movie')
@UseFilters(PrismaClientExceptionFilter)
@Serialize(MovieEntity)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ description: 'Get all movies' })
  @ApiOkResponse({ type: MovieEntity, isArray: true })
  async findAllMovies(): Promise<MovieEntity[]> {
    const movies = await this.movieService.findAllMovies()

    return movies
  }

  @Get('cinemaHall/:cinemaHallId')
  @ApiOperation({ description: 'Get all available movies for cinema hall (by cinema hall id)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieEntity })
  async findMoviesForCinemaHall(
    @Param('cinemaHallId', ParseIntPipe) cinemaHallId: number,
    @GetMovieQuery('fields') queryFields?: Record<string, boolean>,
  ) {
    const moviesForCinemaHall = await this.movieService.findMoviesForCinemaHall({
      cinemaHallId,
      fields: queryFields,
    })

    return moviesForCinemaHall
  }

  @Get(':movieId')
  @ApiOperation({ description: 'Get one movie by movieId (from MovieRecord)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieEntity })
  async findOneMovie(@Param('movieId', ParseIntPipe) movieId: number): Promise<MovieEntity> {
    const movie = await this.movieService.findOneMovie(movieId)

    if (!movie) {
      throw new NotFoundException(`Could not find movie with ${movieId}.`)
    }

    return movie
  }
}
