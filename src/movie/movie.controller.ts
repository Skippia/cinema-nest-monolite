import { Controller, Get, NotFoundException, Param, ParseIntPipe, UseFilters } from '@nestjs/common'
import { MovieService } from './movie.service'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { NotFoundResponseDto } from '../utils/commonDtos/errors/not-found-response.dto'
import { MovieEntity } from './entity/MovieEntity'
import { Serialize } from '../interceptors/serialize.interceptor'
import { Public } from '../auth/decorators/public.decorator'

@Controller('movies')
@ApiTags('Movie')
@UseFilters(PrismaClientExceptionFilter)
@Serialize(MovieEntity)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ description: 'Get all movies' })
  @ApiOkResponse({ type: MovieEntity, isArray: true })
  findAllMovies(): MovieEntity[] {
    const movies = this.movieService.findAllMovies()

    return movies
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
