import { Injectable } from '@nestjs/common'
import { AddMovieToCinemaDto } from 'src/movie/dto/MovieCinemaDtos/add-movie-to-cinema.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as movies from '../../data/movies.json'

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  findAllMovies() {
    return movies
  }

  findOneMovie(movieId: string) {
    return movies.find((movie) => movie.id === movieId)
  }

  async addMoviesToCinema(moviesToCinemaData: AddMovieToCinemaDto) {
    const { movieIds, cinemaId } = moviesToCinemaData
    const transformedMoviesToCinemaData = movieIds.map((movieId) => ({
      movieId,
      cinemaId,
    }))

    /**
     * In createMany is impossible to return created records
     * */
    const newMovieIds = await this.prisma.$transaction(
      transformedMoviesToCinemaData.map((movieToCinema) =>
        this.prisma.movieOnCinema.create({
          data: movieToCinema,
          select: {
            movieId: true,
          },
        }),
      ),
    )

    return newMovieIds.map((m) => this.findOneMovie(m.movieId))
  }

  async findMoviesOnCinema(cinemaId: number) {
    const movieIds = await this.prisma.movieOnCinema.findMany({
      where: {
        cinemaId,
      },
      select: {
        movieId: true,
      },
    })

    return movieIds.map((m) => this.findOneMovie(m.movieId))
  }

  async deleteMovieOnCinema(cinemaId: number, movieId: string) {
    const removedMovieId = await this.prisma.movieOnCinema.delete({
      where: {
        cinemaId_movieId: {
          cinemaId,
          movieId,
        },
      },
      select: {
        movieId: true,
      },
    })

    return this.findOneMovie(removedMovieId.movieId)
  }

  resetMoviesOnCinema(cinemaId: number) {
    return this.prisma.movieOnCinema.deleteMany({
      where: {
        cinemaId,
      },
    })
  }
}
