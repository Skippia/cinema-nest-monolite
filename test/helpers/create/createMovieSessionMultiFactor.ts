import { MovieSession, TypeSeat, TypeSeatEnum } from '@prisma/client'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function createMovieSessionMultiFactor(
  prisma: PrismaService,
  options: {
    movieSession: MovieSession
    mapSeat: TypeSeat[]
    priceFactors: Record<TypeSeatEnum, number>
  },
) {
  await prisma.movieSessionMultiFactor.createMany({
    data: Object.keys(TypeSeatEnum).map((typeSeatEnumKey) => ({
      movieSessionId: options.movieSession.id,
      typeSeatId: options.mapSeat.find((el) => el.type === typeSeatEnumKey)?.id as number,
      priceFactor: options.priceFactors[typeSeatEnumKey as keyof typeof options.priceFactors],
    })),
  })
}
