import { MovieSession, TypeSeat } from '@prisma/client'
import { ISeatsSchema } from '../../../utils/types'

export const calcTotalPrice = (
  seatsSchema: ISeatsSchema,
  multiFactorsArr: { priceFactor: number; typeSeat: TypeSeat }[],
  movieSession: MovieSession,
) =>
  seatsSchema.reduce((totalPrice, curSeat) => {
    const priceForCurrentSeat =
      movieSession.price * (multiFactorsArr.find((factor) => factor.typeSeat.type === curSeat.type)?.priceFactor || 1)
    return totalPrice + priceForCurrentSeat
  }, 0)
