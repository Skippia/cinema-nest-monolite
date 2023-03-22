import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseFilters } from '@nestjs/common'
import { MovieService } from './movie.service'
import { FindMovieDto } from './dto/find-movie.dto'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AddMovieToCinemaDto } from '../movie/dto/MovieCinemaDtos/add-movie-to-cinema.dto'
import { DeleteManyDto } from '../utils/commonDtos/delete-many.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'

@Controller('movies')
@ApiTags('Movie')
@UseFilters(PrismaClientExceptionFilter)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOkResponse({ type: FindMovieDto, isArray: true })
  findAllMovies() {
    const movies = this.movieService.findAllMovies()
    return movies
  }

  @Get(':movieId')
  @ApiOkResponse({ type: FindMovieDto })
  findOneMovie(@Param('movieId') movieId: string) {
    const movie = this.movieService.findOneMovie(movieId)
    return movie
  }
  /**
   * MovieInCinema operations
   */

  @Post('movies-in-cinema')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async addMoviesToCinema(@Body() dto: AddMovieToCinemaDto) {
    const addedMoviesToCinema = await this.movieService.addMoviesToCinema(dto)
    return addedMoviesToCinema
  }

  @Get('movies-in-cinema/:cinemaId/:movieId')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async checkIfMovieAvailableForCinema(
    @Param('movieId') movieId: string,
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ) {
    const isMovieAvailableForCinema = await this.movieService.checkIfMovieAvailableForCinema(movieId, cinemaId)
    return isMovieAvailableForCinema
  }

  @Get('movies-in-cinema/:cinemaId')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  async findMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    const moviesInCinema = await this.movieService.findMoviesInCinema(cinemaId)
    return moviesInCinema
  }

  @Delete('movies-in-cinema/:cinemaId/:movieId')
  @ApiOkResponse({ type: FindMovieDto })
  async deleteMovieFromCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Param('movieId') movieId: string) {
    const deletedMovieFromCinema = await this.movieService.deleteMovieFromCinema(cinemaId, movieId)
    return deletedMovieFromCinema
  }

  @Delete('movies-in-cinema/:cinemaId')
  @ApiOkResponse({ type: DeleteManyDto })
  async resetMoviesInCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    const countDeletedMoviesFromCinema = await this.movieService.resetMoviesInCinema(cinemaId)
    return countDeletedMoviesFromCinema
  }
}
