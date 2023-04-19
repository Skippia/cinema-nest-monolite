import { SeatPos } from '../../modules/seats-in-cinema-hall/utils/types'

export type MergedCinemaBookingSeatingSchema = (SeatPos & {
  bookingCol: number
  bookingRow: number
  isBooked: boolean
})[]
