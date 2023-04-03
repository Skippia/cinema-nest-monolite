import { ISeatPos } from '../../../seats-in-cinema/utils/types'
import { IBookingSchema } from '../../../utils/types'

export function generateActualBookingSchema(
  sourceBookingSchema: IBookingSchema,
  bookedSeatsForMovieSession: ISeatPos[],
): IBookingSchema {
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
