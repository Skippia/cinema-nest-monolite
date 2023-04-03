import { ISeatPosWithType, TypeSeatEnumFull } from '../../../utils/types'
import { ISeatPos } from '../types'
import { TFnOverride } from './ChainSeatsOverrider'

export function overrideWithVipSeats(vipSeats: ISeatPos[]): TFnOverride {
  return (basedSeatsSchema: ISeatPosWithType[]) => {
    vipSeats.forEach((seat) => {
      const idx = basedSeatsSchema.findIndex((el) => el.col === seat.col && el.row === seat.row)

      if (idx !== -1) {
        basedSeatsSchema[idx].type = TypeSeatEnumFull.VIP
      }
    })

    return basedSeatsSchema
  }
}
