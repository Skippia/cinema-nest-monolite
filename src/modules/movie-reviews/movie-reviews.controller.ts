import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger'
import { NotFoundResponseDto } from 'src/common/dtos/errors'
import { Serialize } from 'src/common/interceptors'
import { MovieReviewsEntity } from './entity'
import { MovieReviewsService } from './movie-reviews.service'

@Controller('movies-reviews')
@ApiTags('Reviews for movies')
@Serialize(MovieReviewsEntity)
export class MovieReviewsController {
  constructor(private readonly movieReviewsService: MovieReviewsService) {}

  @Get()
  @ApiOkResponse({ type: MovieReviewsEntity, isArray: true })
  @ApiOperation({ description: 'Get all reviews' })
  findAllMoviesReviews(): MovieReviewsEntity[] {
    const allMoviesReviews = this.movieReviewsService.findAllMoviesReviews()

    return allMoviesReviews
  }

  @Get(':movieId')
  @ApiOperation({
    description: 'Get reviews for movie by movieId (from MovieRecord)',
  })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiOkResponse({ type: MovieReviewsEntity })
  async findReviewsByMovie(
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<MovieReviewsEntity> {
    const movieReviews = await this.movieReviewsService.findReviewsByMovie(movieId)

    if (!movieReviews) {
      throw new NotFoundException(`Could not find reviews for movie with ${movieId}.`)
    }

    return movieReviews
  }
}
