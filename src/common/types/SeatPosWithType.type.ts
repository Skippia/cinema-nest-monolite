import { TypeSeatEnum } from '@prisma/client'
import { SeatPos } from '../../modules/seats-in-cinema-hall/utils/types'

export type SeatPosWithType = SeatPos & { type: TypeSeatEnum }
