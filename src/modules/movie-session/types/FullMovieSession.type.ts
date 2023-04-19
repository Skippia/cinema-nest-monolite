import { MovieSession } from '@prisma/client'
import { HallTypeEnum } from 'src/modules/seats-in-cinema-hall/utils/types'

export type FullMovieSession = MovieSession & {
  amountAvailableSeats?: number
  hallType: HallTypeEnum
}
