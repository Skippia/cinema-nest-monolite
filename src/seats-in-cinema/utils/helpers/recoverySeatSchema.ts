import { IFullSeatsSchema, TypeSeatEnumFull } from '../../../utils/types'
import { ISeatPos } from '../types'
import { findMaxColRow } from './seat-helpers'

export function recoverySeatSchema(cutSeatSchema: ISeatPos[]): IFullSeatsSchema {
  const { maxCol, maxRow } = findMaxColRow(cutSeatSchema)

  const array = [] as IFullSeatsSchema

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
