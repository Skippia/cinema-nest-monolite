import { MovieSession, TypeSeat } from '@prisma/client'
import { SeatsSchema } from 'src/common/types'

export const calcTotalPrice = (
  seatsSchema: SeatsSchema,
  multiFactorsArr: { priceFactor: number; typeSeat: TypeSeat }[],
  movieSession: MovieSession,
) =>
  seatsSchema.reduce((totalPrice, curSeat) => {
    const priceForCurrentSeat =
      movieSession.price *
      (multiFactorsArr.find((factor) => factor.typeSeat.type === curSeat.type)?.priceFactor || 1)
    return totalPrice + priceForCurrentSeat
  }, 0)
