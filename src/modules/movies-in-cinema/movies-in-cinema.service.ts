import { Injectable } from '@nestjs/common'
import { MovieOnCinema, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { AddMovieToCinemaDto } from './dto'

@Injectable()
export class MoviesInCinemaService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIfMovieAvailableForCinema(movieId: number, cinemaId: number): Promise<boolean> {
    return !!(await this.prisma.movieOnCinema.findUnique({
      where: {
        cinemaId_movieId: {
          movieId,
          cinemaId,
        },
      },
    }))
  }

  async addMoviesToCinema(moviesToCinemaData: AddMovieToCinemaDto): Promise<MovieOnCinema[]> {
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

    return newMoviesInCinema
  }

  async findMoviesInCinema(cinemaId: number): Promise<MovieOnCinema[]> {
    return await this.prisma.movieOnCinema.findMany({
      where: {
        cinemaId,
      },
    })
  }

  async deleteMovieFromCinema(cinemaId: number, movieId: number): Promise<MovieOnCinema> {
    return await this.prisma.movieOnCinema.delete({
      where: {
        cinemaId_movieId: {
          cinemaId,
          movieId,
        },
      },
    })
  }

  async resetMoviesInCinema(cinemaId: number): Promise<Prisma.BatchPayload> {
    return await this.prisma.movieOnCinema.deleteMany({
      where: {
        cinemaId,
      },
    })
  }
}
