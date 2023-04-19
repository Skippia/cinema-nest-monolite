import { MovieSession, Prisma } from '@prisma/client'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function createMovieSession(
  prisma: PrismaService,
  params: Prisma.MovieSessionUncheckedCreateInput,
): Promise<MovieSession> {
  const movieSession = await prisma.movieSession.create({
    data: params,
  })

  return movieSession
}
