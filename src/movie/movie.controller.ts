import { Controller, Get, NotFoundException, Param, ParseIntPipe, UseFilters } from '@nestjs/common'
import { MovieService } from './movie.service'
import { FindMovieDto } from './dto/find-movie.dto'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Movie } from './dto/types'
import { NotFoundResponseDto } from 'src/utils/commonDtos/errors/not-found-response.dto'

@Controller('movies')
@ApiTags('Movie')
@UseFilters(PrismaClientExceptionFilter)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ description: 'Get all movies' })
  @ApiOkResponse({ type: FindMovieDto, isArray: true })
  findAllMovies(): Movie[] {
    const movies = this.movieService.findAllMovies()

    return movies
  }

  @Get(':movieId')
  @ApiOperation({ description: 'Get one movie by movieId (from MovieRecord)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: FindMovieDto })
  async findOneMovie(@Param('movieId', ParseIntPipe) movieId: number): Promise<Movie> {
    const movie = await this.movieService.findOneMovie(movieId)

    if (!movie) {
      throw new NotFoundException(`Could not find movie with ${movieId}.`)
    }

    return movie
  }
}
