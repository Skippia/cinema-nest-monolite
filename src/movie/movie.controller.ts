import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseFilters } from '@nestjs/common'
import { MovieService } from './movie.service'
import { FindMovieDto } from './dto/find-movie.dto'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AddMovieToCinemaDto } from 'src/movie/dto/MovieCinemaDtos/add-movie-to-cinema.dto'
import { DeleteManyDto } from 'src/utils/commonDtos/delete-many.dto'
import { PrismaClientExceptionFilter } from 'src/prisma/prisma-client-exception'

@Controller('movies')
@ApiTags('Movie')
@UseFilters(PrismaClientExceptionFilter)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOkResponse({ type: FindMovieDto, isArray: true })
  findAll() {
    return this.movieService.findAllMovies()
  }

  @Get(':movieId')
  @ApiOkResponse({ type: FindMovieDto })
  findOne(@Param('movieId') movieId: string) {
    return this.movieService.findOneMovie(movieId)
  }
  /**
   * MovieOnCinema operations
   */

  @Post('movies-in-cinema')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  addMoviesToCinema(@Body() dto: AddMovieToCinemaDto) {
    return this.movieService.addMoviesToCinema(dto)
  }

  @Get('movies-in-cinema/:cinemaId')
  @ApiCreatedResponse({ type: FindMovieDto, isArray: true })
  findMoviesOnCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    return this.movieService.findMoviesOnCinema(cinemaId)
  }

  @Delete('movies-in-cinema/:cinemaId/:movieId')
  @ApiOkResponse({ type: FindMovieDto })
  deleteMovieOnCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number, @Param('movieId') movieId: string) {
    return this.movieService.deleteMovieOnCinema(cinemaId, movieId)
  }

  @Delete('movies-in-cinema/:cinemaId')
  @ApiOkResponse({ type: DeleteManyDto })
  resetMoviesOnCinema(@Param('cinemaId', ParseIntPipe) cinemaId: number) {
    return this.movieService.resetMoviesOnCinema(cinemaId)
  }
}
