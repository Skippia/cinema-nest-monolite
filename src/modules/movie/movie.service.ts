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

  async findMoviesForCinemaHall({
    cinemaHallId,
    fields,
  }: {
    cinemaHallId: number
    fields?: Record<string, boolean>
  }) {
    // Select all unique available movies from movies sessions for cinema hall by cinema hall id

    const movieIds = (await this.prisma.$queryRaw(Prisma.sql`
      SELECT DISTINCT("movieId") FROM "CinemaHall" as "CH"
      JOIN "MovieSession" as "MS" ON "CH"."id" = "MS"."cinemaHallId"
      WHERE "CH".id = ${cinemaHallId} 
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
