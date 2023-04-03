import { IBookingSchema, ISeatPosWithType, ISeatsSchema, TypeSeatEnumFull } from '../../../utils/types'
import { ISeatPos } from '../types'

export const sortSeatBy = (seats: ISeatPos[], criteria: 'row' | 'col') =>
  [...seats].sort((pos1, pos2) => (pos1[criteria] >= pos2[criteria] ? 1 : -1))

export const findSeatsInLastRow = (bookingSchema: IBookingSchema, lastRow: number) =>
  bookingSchema.filter((pos) => pos.row === lastRow + 1)

export const findLastSeatByCurRow = (bookingSchema: IBookingSchema, curPos: ISeatPos) =>
  bookingSchema.filter((pos) => pos.row === curPos.row)?.at(-1)

export const findOtherSeatsForCurRow = (seats: ISeatPos[], curPos: ISeatPos, beginWith: number) =>
  seats.slice(beginWith + 1).find((pos) => pos.row === curPos.row)

export const addSeatToBooking = (bookingSchema: IBookingSchema, { col, row, type }: ISeatPosWithType) => {
  bookingSchema.push({ row, col, type, isBooked: false })
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

export const filterBySeat = (schema: ISeatsSchema) => schema.filter((pos) => pos.type === TypeSeatEnumFull.SEAT)
