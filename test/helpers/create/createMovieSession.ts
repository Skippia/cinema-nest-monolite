import { MovieSession, Prisma } from '@prisma/client'
import { PrismaService } from 'src/modules/prisma/prisma.service'

export async function createMovieSession(
  prisma: PrismaService,
  params: Prisma.MovieSessionUncheckedCreateInput,
): Promise<MovieSession> {
  const movieSession = await prisma.movieSession.create({
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      movieId: params.movieId,
      cinemaId: params.cinemaId,
      price: params.price,
      currency: params.currency,
    },
  })

  return movieSession
}
