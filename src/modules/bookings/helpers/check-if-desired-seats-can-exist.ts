import { SeatPos } from 'src/modules/seats-in-cinema-hall/utils/types'

export function checkIfDesiredSeatsCanExist({
  set,
  subset,
}: {
  set: SeatPos[]
  subset: SeatPos[]
}) {
  const seatsOutOfBookingSchema = subset.filter((subsetSeat) => {
    return !set.some((setSeat) => setSeat.row === subsetSeat.row && setSeat.col === subsetSeat.col)
  })

  return {
    isDesiredSeatsCanExist: seatsOutOfBookingSchema.length === 0,
    wrongSeats: seatsOutOfBookingSchema,
  }
}
