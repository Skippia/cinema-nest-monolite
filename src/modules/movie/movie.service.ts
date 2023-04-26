import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import movies from '../../../data/movies.json'
import { Movie } from './types'
import { Prisma } from '@prisma/client'
import { MovieField } from './dto'

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllMovies(): Promise<Movie[]> {
    return movies
  }

  async findOneMovie(id: number): Promise<Movie | undefined> {
    const movieRecord = await this.prisma.movieRecord.findUnique({
      where: {
        id,
      },
    })

    if (movieRecord) {
      return movies.find((movie) => movie.id === movieRecord.imdbId)
    }
  }

  async findMoviesForCinema({
    cinemaId,
    fields,
  }: {
    cinemaId: number
    fields?: Record<string, boolean>
  }) {
    // Select all unique available movies from movies sessions for cinema by cinema id

    const movieIds = (await this.prisma.$queryRaw(Prisma.sql`
      SELECT DISTINCT("movieId") FROM "Cinema" AS "C"
      JOIN "CinemaHall" as "CH" ON "C"."id" = "CH"."cinemaId"
      JOIN "MovieSession" as "MS" ON "CH"."id" = "MS"."cinemaHallId"
      WHERE "C"."id" = ${cinemaId}
    `)) as { movieId: number }[]

    const movies = (await Promise.all(
      movieIds.map((el) => this.findOneMovie(el.movieId)),
    )) as Movie[]

    if (!fields) return movies

    const moviesPartialData = movies.map((movie) => {
      const cutMovie = (Object.keys(fields) as MovieField[]).reduce(
        (acc, curQuery) => ({ ...acc, [curQuery]: movie[curQuery] }),
        {} as Record<MovieField, Movie[MovieField]>,
      )

      return cutMovie
    })

    return moviesPartialData
  }
}
