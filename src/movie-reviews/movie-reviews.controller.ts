import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common'
import { MovieReviewsService } from './movie-reviews.service'
import { FindMovieReviewsDto } from './dto/find-movie-reviews.dto'
import { MovieReviews } from './dto/types'

@Controller('movies-reviews')
@ApiTags('Reviews for movies')
export class MovieReviewsController {
  constructor(private readonly movieReviewsService: MovieReviewsService) {}

  @Get()
  @ApiOkResponse({ type: FindMovieReviewsDto, isArray: true })
  findAllMoviesReviews(): MovieReviews[] {
    const allMoviesReviews = this.movieReviewsService.findAllMoviesReviews()

    return allMoviesReviews
  }

  @Get(':movieId')
  @ApiOkResponse({ type: FindMovieReviewsDto })
  async findReviewsByMovie(@Param('movieId', ParseIntPipe) movieId: number): Promise<MovieReviews> {
    const movieReviews = await this.movieReviewsService.findReviewsByMovie(movieId)

    if (!movieReviews) {
      throw new NotFoundException(`Could not find reviews for movie with ${movieId}.`)
    }

    return movieReviews
  }
}
