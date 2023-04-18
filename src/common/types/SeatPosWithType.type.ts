import { TypeSeatEnum } from '@prisma/client'
import { SeatPos } from 'src/modules/seats-in-cinema-hall/utils/types'

export type SeatPosWithType = SeatPos & { type: TypeSeatEnum }
