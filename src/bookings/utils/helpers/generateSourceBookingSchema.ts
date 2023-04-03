import { ISeatPos } from '../../../seats-in-cinema/utils/types'
import { ISeatsSchema, IBookingSchema } from '../../../utils/types'
import {
  sortSeatBy,
  findLastSeatByCurRow,
  findSeatsInLastRow,
  addSeatToBooking,
  findOtherSeatsForCurRow,
} from '../../../seats-in-cinema/utils/helpers/seat-helpers'

export function generateSourceBookingSchema(seatSchema: ISeatsSchema): IBookingSchema {
  const bookingSchema = [] as IBookingSchema
  let lastRow = 0

  const sortedSeatSchema = sortSeatBy(seatSchema, 'row') as ISeatsSchema

  // const filteredSeatSchema = filterBySeat(sortedSeatSchema)

  sortedSeatSchema.forEach((curPos, idx) => {
    const lastSeatInCurRow = findLastSeatByCurRow(bookingSchema, curPos)

    if (!lastSeatInCurRow) {
      const seatsInLastRow = findSeatsInLastRow(bookingSchema, lastRow)

      const sortedSeatsInLastRow = sortSeatBy(seatsInLastRow, 'col')

      if (sortedSeatsInLastRow.length > 0) {
        const lastCol = (sortedSeatsInLastRow.at(-1) as ISeatPos).col
        addSeatToBooking(bookingSchema, { row: lastRow + 1, col: lastCol + 1, type: curPos.type })
      } else {
        addSeatToBooking(bookingSchema, { row: lastRow + 1, col: 1, type: curPos.type })
      }

      const isOtherSeatsForCurRow = findOtherSeatsForCurRow(sortedSeatSchema, curPos, idx)

      if (!isOtherSeatsForCurRow) {
        lastRow++
      }
    }

    if (lastSeatInCurRow) {
      addSeatToBooking(bookingSchema, { row: lastSeatInCurRow.row, col: lastSeatInCurRow.col + 1, type: curPos.type })
      lastRow = lastSeatInCurRow.row
    }
  })

  return bookingSchema
}
