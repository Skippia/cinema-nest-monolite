import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import movies from '../../../data/movies.json'
import { Movie } from './types'
import { Prisma } from '@prisma/client'
import { MovieField } from './dto'
import path from 'path'
import fs from 'fs/promises'
import { S3Service } from '../s3/s3.service'

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService, private readonly s3Service: S3Service) {}

  async findAllMovies(): Promise<Movie[]> {
    return movies
  }

  async findOneMovie(id: number, redirect = false): Promise<Movie | undefined> {
    const movieRecord = await this.prisma.movieRecord.findUnique({
      where: {
        id,
      },
    })

    if (movieRecord) {
      const movie = movies.find((movie) => movie.id === movieRecord.id)

      if (!movie) return

      if (redirect) {
        return movie
      }

      const thumbnailPreviewImageFromTrailer =
        await this.generateOrReturnThumbnailPreviewUrlForMovie(id)

      return { ...movie, thumbnailPreviewImageFromTrailer }
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

  async updateMovie(movieId: number, updatedMovie: Movie): Promise<Movie> {
    const filePath = path.join(__dirname, '../../../data/movies.json').replace('dist/', '')
    const idx = movies.findIndex((el) => el.id === movieId)

    movies[idx] = updatedMovie as any

    await fs.writeFile(filePath, JSON.stringify(movies))

    return updatedMovie
  }

  async updateLinkImagePreviewImageForTrailer({
    movieId,
    urlFileNamePreviewImageFromTrailer,
  }: {
    movieId: number
    urlFileNamePreviewImageFromTrailer: string
  }): Promise<string> {
    const movie = await this.findOneMovie(movieId, true)

    const updatedMovie = {
      ...movie,
      thumbnailPreviewImageFromTrailer: urlFileNamePreviewImageFromTrailer,
    } as Movie

    await this.updateMovie(movieId, updatedMovie)

    return urlFileNamePreviewImageFromTrailer
  }

  async generateOrReturnThumbnailPreviewUrlForMovie(movieId: number): Promise<string> {
    const movie = (await this.findOneMovie(movieId, true)) as Movie

    // Preview already exists - return it
    if (movie.thumbnailPreviewImageFromTrailer) {
      return movie.thumbnailPreviewImageFromTrailer
    }

    // Preview is not exist - generate it
    else {
      const trailerUrl = movie.trailer

      // 1. Folder to save screenshot from trailer
      const folderPathRoot = path.join('/home/lormida/tmp')
      const folderPath = path.join(
        folderPathRoot,
        `${Date.now()}-${movieId}-${Math.round(Math.random() * 100)}`,
      )

      // 2. Get name of future loaded screenshot
      const fileNamePreviewImageFromTrailer =
        this.s3Service.generateFileNameFromTrailerUrl(trailerUrl)

      console.log('download video')
      // 3. Download video and save in temporal folder (with `salt`)
      this.s3Service.downloadVideoAndSaveInFolder({
        trailerUrl,
        folderPath,
        fileName: fileNamePreviewImageFromTrailer,
      })

      // 4. Load this screenshot in cloud storage and get url link
      const generatedLink = await this.s3Service.uploadImagePreviewImageFromTrailer({
        folderPath,
        fileName: fileNamePreviewImageFromTrailer,
      })

      // 5. Remove tmp screenshot along with folder
      await fs.rmdir(folderPath, { recursive: true })

      // 6. Update movie
      this.updateLinkImagePreviewImageForTrailer({
        movieId,
        urlFileNamePreviewImageFromTrailer: generatedLink,
      })

      return generatedLink
    }
  }
}
