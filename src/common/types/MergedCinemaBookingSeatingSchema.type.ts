import { SeatPos } from 'src/modules/seats-in-cinema/utils/types'

export type MergedCinemaBookingSeatingSchema = (SeatPos & {
  bookingCol: number
  bookingRow: number
  isBooked: boolean
})[]
