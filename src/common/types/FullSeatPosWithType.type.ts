import { SeatPos } from 'src/modules/seats-in-cinema/utils/types'
import { FullSeatType } from './FullSeatType.type'

export type FullSeatPosWithType = SeatPos & { type: FullSeatType }
