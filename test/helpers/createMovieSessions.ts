import { MovieSession } from '@prisma/client'
import { PrismaService } from './../../src/prisma/prisma.service'
export async function createMovieSessions(prisma: PrismaService): Promise<MovieSession[]> {
  const movieSession1 = await prisma.movieSession.create({
    data: {
      // startDate: '2024-01-10T10:00:01.504Z',
      // endDate: '2024-01-10T12:50:01.504Z',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
      endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
      movieId: 1,
      cinemaId: 1,
      price: 40,
      currency: 'USD',
    },
  })

  const movieSession2 = await prisma.movieSession.create({
    data: {
      // startDate: '2024-01-10T10:00:01.504Z',
      // endDate: '2024-01-10T12:50:01.504Z',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
      endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
      movieId: 1,
      cinemaId: 2,
      price: 60,
      currency: 'USD',
    },
  })

  const movieSession3 = await prisma.movieSession.create({
    data: {
      // startDate: '2024-01-10T10:00:01.504Z',
      // endDate: '2024-01-10T12:10:01.504Z',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1)),
      endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1)),
      movieId: 2,
      cinemaId: 3,
      price: 80,
      currency: 'USD',
    },
  })

  return [movieSession1, movieSession2, movieSession3]
}
