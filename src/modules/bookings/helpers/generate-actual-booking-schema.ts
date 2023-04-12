import { BookingSchema } from 'src/common/types'
import { SeatPos } from 'src/modules/seats-in-cinema/utils/types'

export function generateActualBookingSchema(
  sourceBookingSchema: BookingSchema,
  bookedSeatsForMovieSession: SeatPos[],
): BookingSchema {
  bookedSeatsForMovieSession.forEach((bookedSeat) => {
    // Find this seat in sourceBookingSchema
    const idx = sourceBookingSchema.findIndex(
      (booking) => booking.col === bookedSeat.col && booking.row === bookedSeat.row,
    )

    // Theoritacally it always true
    if (idx !== -1) {
      // Set this seat as booked
      sourceBookingSchema[idx].isBooked = true
    }
  })

  return sourceBookingSchema
}
