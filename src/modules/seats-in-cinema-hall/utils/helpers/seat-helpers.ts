import { BookingSchema, SeatPosWithType, SeatsSchema, TypeSeatEnumFull } from 'src/common/types'
import { SeatPos } from '../types'

export const sortSeatBy = (seats: SeatPos[], criteria: 'row' | 'col') =>
  [...seats].sort((pos1, pos2) => (pos1[criteria] >= pos2[criteria] ? 1 : -1))

export const findSeatsInLastRow = (bookingSchema: BookingSchema, lastRow: number) =>
  bookingSchema.filter((pos) => pos.row === lastRow + 1)

export const findLastSeatByCurRow = (bookingSchema: BookingSchema, curPos: SeatPos) =>
  bookingSchema.filter((pos) => pos.row === curPos.row)?.at(-1)

export const findOtherSeatsForCurRow = (seats: SeatPos[], curPos: SeatPos, beginWith: number) =>
  seats.slice(beginWith + 1).find((pos) => pos.row === curPos.row)

export const addSeatToBooking = (
  bookingSchema: BookingSchema,
  { col, row, type }: SeatPosWithType,
) => {
  bookingSchema.push({ row, col, type, isBooked: false })
}

export function findMaxColRow(seatsArray: SeatPos[]) {
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

export const filterBySeat = (schema: SeatsSchema) =>
  schema.filter((pos) => pos.type === TypeSeatEnumFull.SEAT)
