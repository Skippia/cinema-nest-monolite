import { SeatPos } from '../../modules/seats-in-cinema-hall/utils/types'
import { FullSeatType } from './FullSeatType.type'

export type MergedFullCinemaBookingSeatingSchema = (SeatPos & {
  type: FullSeatType
  bookingCol?: number
  bookingRow?: number
  isBooked?: boolean
})[]
