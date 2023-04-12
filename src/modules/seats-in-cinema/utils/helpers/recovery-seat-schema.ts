import { FullSeatsSchema, TypeSeatEnumFull } from 'src/common/types'
import { SeatPos } from '../types'
import { findMaxColRow } from './seat-helpers'

export function recoverySeatSchema(cutSeatSchema: SeatPos[]): FullSeatsSchema {
  const { maxCol, maxRow } = findMaxColRow(cutSeatSchema)

  const array = [] as FullSeatsSchema

  for (let col = 1; col <= maxCol; col++) {
    for (let row = 1; row <= maxRow; row++) {
      const curPos = cutSeatSchema.find((seatPos) => seatPos.col === col && seatPos.row === row)
      curPos
        ? array.push({ ...curPos, type: TypeSeatEnumFull.SEAT })
        : array.push({ row, col, type: TypeSeatEnumFull.EMPTY })
    }
  }

  return array
}
