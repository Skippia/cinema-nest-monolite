import {
  FullSeatsSchema,
  BookingSchema,
  MergedFullCinemaBookingSeatingSchema,
  TypeSeatEnumFull,
} from 'src/common/types'

export function generateMergedCinemaBookingSeatingSchema(
  seatSchema: FullSeatsSchema,
  bookingSchema: BookingSchema,
): MergedFullCinemaBookingSeatingSchema {
  const sortedSeatSchema = [...seatSchema].sort((a, b) => a.row - b.row || a.col - b.col)
  const sortedBookingSchema = [...bookingSchema].sort((a, b) => a.row - b.row || a.col - b.col)

  let offsetIdx = 0

  return sortedSeatSchema.map((seat) => {
    if (seat.type === TypeSeatEnumFull.EMPTY) return seat

    const bookingSeat = sortedBookingSchema[offsetIdx]

    offsetIdx++

    return {
      ...seat,
      bookingCol: bookingSeat.col,
      bookingRow: bookingSeat.row,
      isBooked: bookingSeat.isBooked,
    }
  })
}
