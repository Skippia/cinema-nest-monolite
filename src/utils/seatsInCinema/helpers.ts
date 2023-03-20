import { ISeatPos, IBookingSchema, ISeatSchemaOutput, IMatrixSeatPos, ISeatsSchemaInput, SeatType } from './types'

export const sortSeatBy = (seats: ISeatPos[], criteria: 'row' | 'col') =>
  [...seats].sort((pos1, pos2) => (pos1[criteria] >= pos2[criteria] ? 1 : -1))

export const findSeatsInLastRow = (bookingSchema: IBookingSchema, lastRow: number) =>
  bookingSchema.filter((pos) => pos.row === lastRow + 1)

export const findLastSeatByCurRow = (bookingSchema: IBookingSchema, curPos: ISeatPos) =>
  bookingSchema.filter((pos) => pos.row === curPos.row)?.at(-1)

export const findOtherSeatsForCurRow = (seats: ISeatPos[], curPos: ISeatPos, beginWith: number) =>
  seats.slice(beginWith + 1).find((pos) => pos.row === curPos.row)

export const addSeatToBooking = (bookingSchema: IBookingSchema, { col, row }: ISeatPos) => {
  bookingSchema.push({ row, col, isBooked: false })
}

export const filterBySeat = (schema: ISeatSchemaOutput) => schema.filter((pos) => pos.type === SeatType.SEAT)

export const isPositionExcluded = (excludeMatrices: IMatrixSeatPos[], { col, row }: ISeatPos) =>
  excludeMatrices.some(
    ({ colStart, colEnd, rowStart, rowEnd }) => col >= colStart && col <= colEnd && row >= rowStart && row <= rowEnd,
  )

export function excludeAreaSeatsPositions(
  seats: ISeatPos[],
  excludeMatrices: IMatrixSeatPos[],
  excludePositions: ISeatPos[],
): ISeatPos[] {
  return (
    seats.map((seat) => {
      // Exclude positions via area
      if (isPositionExcluded(excludeMatrices, seat)) {
        return { ...seat, type: SeatType.EMPTY }
      }

      // Exclude positions
      if (
        excludePositions.filter((excludeSeat) => excludeSeat.col === seat.col && excludeSeat.row === seat.row).length >
        0
      ) {
        return { ...seat, type: SeatType.EMPTY }
      }

      return { ...seat }
    }) as (ISeatPos & { type?: SeatType.EMPTY })[]
  ).filter((seat) => seat?.type !== SeatType.EMPTY)
}

export function generateSeatSchema(seatsSchemaData: ISeatsSchemaInput): ISeatPos[] {
  const { colLength, rowLength, areasExclude, positionsExclude } = seatsSchemaData

  /**
   * Generate all seats for these col * row
   */
  const rectangePositions = generateSeatsOnRectangle(colLength, rowLength)

  /**
   * Exclude positions accord to the input schema
   * and return seats without empties
   */
  return excludeAreaSeatsPositions(rectangePositions, areasExclude || [], positionsExclude || [])
}

export function findMaxColRow(seatsArray: ISeatPos[]) {
  let maxCol = 0
  let maxRow = 0
  for (const seat of seatsArray) {
    if (seat.col > maxCol) {
      maxCol = seat.col
    }
    if (seat.row > maxRow) {
      maxRow = seat.row
    }
  }
  return { maxCol, maxRow }
}

export function recoverySeatSchema(cutSeatSchema: ISeatPos[]): ISeatSchemaOutput {
  const { maxCol, maxRow } = findMaxColRow(cutSeatSchema)

  const array = [] as ISeatSchemaOutput

  for (let col = 1; col <= maxCol; col++) {
    for (let row = 1; row <= maxRow; row++) {
      const curPos = cutSeatSchema.find((seatPos) => seatPos.col === col && seatPos.row === row)
      curPos ? array.push({ ...curPos, type: SeatType.SEAT }) : array.push({ row, col, type: SeatType.EMPTY })
    }
  }

  return array
}

export function generateSeatsOnRectangle(colLength: number, rowLength: number): ISeatPos[] {
  const array = []
  for (let x = 1; x <= colLength; x++) {
    for (let y = 1; y <= rowLength; y++) {
      array.push({ col: x, row: y })
    }
  }
  return array
}
