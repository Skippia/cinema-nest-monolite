import { Injectable } from '@nestjs/common'
import { AddMovieToCinemaDto } from '../movie/dto/MovieCinemaDtos/add-movie-to-cinema.dto'
import { PrismaService } from '../prisma/prisma.service'
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

  async checkIfMovieAvailableForCinema(movieId: string, cinemaId: number) {
    return !!(await this.prisma.movieOnCinema.findUnique({
      where: {
        cinemaId_movieId: {
          movieId,
          cinemaId,
        },
      },
    }))
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
    const newMoviesInCinema = await this.prisma.$transaction(
      transformedMoviesToCinemaData.map((movieToCinema) =>
        this.prisma.movieOnCinema.create({
          data: movieToCinema,
        }),
      ),
    )

    return newMoviesInCinema.map((m) => this.findOneMovie(m.movieId))
  }

  async findMoviesInCinema(cinemaId: number) {
    const moviesInCinema = await this.prisma.movieOnCinema.findMany({
      where: {
        cinemaId,
      },
    })

    return moviesInCinema.map((m) => this.findOneMovie(m.movieId))
  }

  async deleteMovieFromCinema(cinemaId: number, movieId: string) {
    const deletedMovieFromCinema = await this.prisma.movieOnCinema.delete({
      where: {
        cinemaId_movieId: {
          cinemaId,
          movieId,
        },
      },
    })

    return this.findOneMovie(deletedMovieFromCinema.movieId)
  }

  async resetMoviesInCinema(cinemaId: number) {
    return await this.prisma.movieOnCinema.deleteMany({
      where: {
        cinemaId,
      },
    })
  }
}
