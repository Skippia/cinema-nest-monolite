import { PrismaService } from './../../../src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { createMovieSession } from './createMovieSession'

// export async function createMovieSessions(prisma: PrismaService): Promise<MovieSession[]> {
//   const movieSession1 = await prisma.movieSession.create({
//     data: {
//       // startDate: '2024-01-10T10:00:01.504Z',
//       // endDate: '2024-01-10T12:50:01.504Z',
//       startDate: new Date(
//         new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1),
//       ),
//       endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
//       movieId: 1,
//       cinemaId: 1,
//       price: 40,
//       currency: 'USD',
//     },
//   })

//   const movieSession2 = await prisma.movieSession.create({
//     data: {
//       // startDate: '2024-01-10T10:00:01.504Z',
//       // endDate: '2024-01-10T12:50:01.504Z',
//       startDate: new Date(
//         new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1),
//       ),
//       endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
//       movieId: 1,
//       cinemaId: 2,
//       price: 60,
//       currency: 'USD',
//     },
//   })

//   const movieSession3 = await prisma.movieSession.create({
//     data: {
//       // startDate: '2024-01-10T10:00:01.504Z',
//       // endDate: '2024-01-10T12:10:01.504Z',
//       startDate: new Date(
//         new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1),
//       ),
//       endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1)),
//       movieId: 2,
//       cinemaId: 3,
//       price: 80,
//       currency: 'USD',
//     },
//   })

//   return [movieSession1, movieSession2, movieSession3]
// }

export async function createMovieSessions(prisma: PrismaService) {
  const movieSession1Params: Prisma.MovieSessionUncheckedCreateInput = {
    startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
    endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
    movieId: 1,
    cinemaId: 1,
    price: 40,
    currency: 'USD',
  }

  const movieSession2Params: Prisma.MovieSessionUncheckedCreateInput = {
    startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 0, 1)),
    endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 50, 1)),
    movieId: 1,
    cinemaId: 2,
    price: 60,
    currency: 'USD',
  }

  const movieSession3Params: Prisma.MovieSessionUncheckedCreateInput = {
    startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(10, 10, 1)),
    endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 6)).setHours(12, 10, 1)),
    movieId: 2,
    cinemaId: 3,
    price: 80,
    currency: 'USD',
  }

  const movieSession1 = await createMovieSession(prisma, movieSession1Params)
  const movieSession2 = await createMovieSession(prisma, movieSession2Params)
  const movieSession3 = await createMovieSession(prisma, movieSession3Params)

  return [movieSession1, movieSession2, movieSession3]
}
