import { TypeSeatEnum } from '@prisma/client'
import { TypeSeatEnumFull } from '../../../utils/types'
import { IMatrixSeatPos, ISeatPos } from '../types'

export const isPositionExcluded = (excludeMatrices: IMatrixSeatPos[], { col, row }: ISeatPos) =>
  excludeMatrices.some(
    ({ colStart, colEnd, rowStart, rowEnd }) =>
      col >= colStart && col <= colEnd && row >= rowStart && row <= rowEnd,
  )

export function excludeAreaSeatsPositions(
  seats: ISeatPos[],
  excludeMatrices: IMatrixSeatPos[],
  excludePositions: ISeatPos[],
): ISeatPos[] {
  const allSeats = seats.map((seat) => {
    // Exclude positions via area
    if (isPositionExcluded(excludeMatrices, seat)) {
      return { ...seat, type: TypeSeatEnumFull.EMPTY }
    }

    // Exclude positions
    if (
      excludePositions.filter(
        (excludeSeat) => excludeSeat.col === seat.col && excludeSeat.row === seat.row,
      ).length > 0
    ) {
      return { ...seat, type: TypeSeatEnumFull.EMPTY }
    }

    return { ...seat }
  }) as (ISeatPos & { type?: TypeSeatEnum })[]

  return allSeats.filter(
    (seat) => seat?.type !== (TypeSeatEnumFull.EMPTY as keyof typeof TypeSeatEnum),
  )
}
