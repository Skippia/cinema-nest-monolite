import { PrismaService } from './../../../src/modules/prisma/prisma.service'
import { TypeSeatEnum } from '@prisma/client'
import { createMovieSession } from './createMovieSession'
import { createMovieSessionMultiFactor } from './createMovieSessionMultiFactor'
import {
  movieSession1DataMock,
  movieSession2DataMock,
  movieSession3DataMock,
} from '../../e2e-tests/movie-session/movie-session.static-mock'

const priceFactors: Record<TypeSeatEnum, number> = {
  SEAT: 1,
  VIP: 1.5,
  LOVE: 2.25,
}

export async function createMovieSessions(prisma: PrismaService) {
  const mapSeat = await prisma.typeSeat.findMany()

  const movieSession1 = await createMovieSession(prisma, movieSession1DataMock)
  const movieSession2 = await createMovieSession(prisma, movieSession2DataMock)
  const movieSession3 = await createMovieSession(prisma, movieSession3DataMock)

  await createMovieSessionMultiFactor(prisma, {
    movieSession: movieSession1,
    mapSeat,
    priceFactors,
  })

  await createMovieSessionMultiFactor(prisma, {
    movieSession: movieSession2,
    mapSeat,
    priceFactors,
  })

  await createMovieSessionMultiFactor(prisma, {
    movieSession: movieSession3,
    mapSeat,
    priceFactors,
  })

  return [movieSession1, movieSession2, movieSession3]
}
