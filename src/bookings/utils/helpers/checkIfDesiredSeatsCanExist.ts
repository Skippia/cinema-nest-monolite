import { ISeatPos } from '../../../seats-in-cinema/utils/types'

export function checkIfDesiredSeatsCanExist({ set, subset }: { set: ISeatPos[]; subset: ISeatPos[] }) {
  const seatsOutOfBookingSchema = subset.filter((subsetSeat) => {
    return !set.some((setSeat) => setSeat.row === subsetSeat.row && setSeat.col === subsetSeat.col)
  })

  return {
    isDesiredSeatsCanExist: seatsOutOfBookingSchema.length === 0,
    wrongSeats: seatsOutOfBookingSchema,
  }
}
