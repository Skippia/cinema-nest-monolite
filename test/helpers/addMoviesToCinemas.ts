import { MovieOnCinema } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

export async function addMoviesToCinemas(
  prisma: PrismaService,
  movieCinemaMap: { movieId: number; cinemaId: number }[],
): Promise<MovieOnCinema[]> {
  const movieCinemas = await Promise.all(
    movieCinemaMap.map((movieCinema) =>
      prisma.movieOnCinema.create({
        data: movieCinema,
      }),
    ),
  )

  return movieCinemas
}
