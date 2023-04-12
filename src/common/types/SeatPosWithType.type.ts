import { TypeSeatEnum } from '@prisma/client'
import { SeatPos } from 'src/modules/seats-in-cinema/utils/types'

export type SeatPosWithType = SeatPos & { type: TypeSeatEnum }
