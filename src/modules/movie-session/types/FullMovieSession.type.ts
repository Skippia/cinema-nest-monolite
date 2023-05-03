import { MovieSession } from '@prisma/client'
import { HallTypeEnum } from '../../../modules/seats-in-cinema-hall/utils/types'

export type FullMovieSession = MovieSession & {
  amountAvailableSeats?: number
  amountReservedSeats?: number
  hallType: HallTypeEnum
}
