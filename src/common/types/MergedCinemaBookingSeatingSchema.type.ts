import { SeatPos } from 'src/modules/seats-in-cinema-hall/utils/types'

export type MergedCinemaBookingSeatingSchema = (SeatPos & {
  bookingCol: number
  bookingRow: number
  isBooked: boolean
})[]
