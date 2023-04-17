import { TypeSeatEnum } from '@prisma/client'
import { TypeSeatEnumFull } from 'src/common/types'
import { MatrixSeatPos, SeatPos } from '../types'

export const isPositionExcluded = (excludeMatrices: MatrixSeatPos[], { col, row }: SeatPos) =>
  excludeMatrices.some(
    ({ colStart, colEnd, rowStart, rowEnd }) =>
      col >= colStart && col <= colEnd && row >= rowStart && row <= rowEnd,
  )

export function excludeAreaSeatsPositions(
  seats: SeatPos[],
  excludeMatrices: MatrixSeatPos[],
  excludePositions: SeatPos[],
): SeatPos[] {
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
  }) as (SeatPos & { type?: TypeSeatEnum })[]

  return allSeats.filter(
    (seat) => seat?.type !== (TypeSeatEnumFull.EMPTY as keyof typeof TypeSeatEnum),
  )
}
