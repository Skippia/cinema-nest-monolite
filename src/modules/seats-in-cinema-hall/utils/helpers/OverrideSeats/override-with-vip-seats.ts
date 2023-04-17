import { SeatPosWithType, TypeSeatEnumFull } from 'src/common/types'
import { SeatPos } from '../../types'
import { TFnOverride } from './chain-seats-overrider'

export function overrideWithVipSeats(vipSeats: SeatPos[]): TFnOverride {
  return (basedSeatsSchema: SeatPosWithType[]) => {
    vipSeats.forEach((seat) => {
      const idx = basedSeatsSchema.findIndex((el) => el.col === seat.col && el.row === seat.row)

      if (idx !== -1) {
        basedSeatsSchema[idx].type = TypeSeatEnumFull.VIP
      }
    })

    return basedSeatsSchema
  }
}
