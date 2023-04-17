import { SeatPosWithType, TypeSeatEnumFull } from 'src/common/types'
import { SeatPos } from '../../types'
import { TFnOverride } from './chain-seats-overrider'

export function overrideWithLoveSeats(loveSeats: SeatPos[]): TFnOverride {
  return (basedSeatsSchema: SeatPosWithType[]): SeatPosWithType[] => {
    loveSeats.forEach((seat) => {
      const idx = basedSeatsSchema.findIndex((el) => el.col === seat.col && el.row === seat.row)

      if (idx !== -1) {
        basedSeatsSchema[idx].type = TypeSeatEnumFull.LOVE
      }
    })

    return basedSeatsSchema
  }
}
