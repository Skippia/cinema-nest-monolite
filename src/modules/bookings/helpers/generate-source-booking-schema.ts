import { SeatsSchema, BookingSchema } from '../../../common/types'
import {
  sortSeatBy,
  findLastSeatByCurRow,
  findSeatsInLastRow,
  addSeatToBooking,
  findOtherSeatsForCurRow,
} from '../../seats-in-cinema-hall/utils/helpers'
import { SeatPos } from '../../seats-in-cinema-hall/utils/types'

export function generateSourceBookingSchema(seatSchema: SeatsSchema): BookingSchema {
  const bookingSchema = [] as BookingSchema
  let lastRow = 0

  const sortedSeatSchema = sortSeatBy(seatSchema, 'row') as SeatsSchema

  // const filteredSeatSchema = filterBySeat(sortedSeatSchema)

  sortedSeatSchema.forEach((curPos, idx) => {
    const lastSeatInCurRow = findLastSeatByCurRow(bookingSchema, curPos)

    if (!lastSeatInCurRow) {
      const seatsInLastRow = findSeatsInLastRow(bookingSchema, lastRow)

      const sortedSeatsInLastRow = sortSeatBy(seatsInLastRow, 'col')

      if (sortedSeatsInLastRow.length > 0) {
        const lastCol = (sortedSeatsInLastRow.at(-1) as SeatPos).col
        addSeatToBooking(bookingSchema, {
          row: lastRow + 1,
          col: lastCol + 1,
          type: curPos.type,
        })
      } else {
        addSeatToBooking(bookingSchema, {
          row: lastRow + 1,
          col: 1,
          type: curPos.type,
        })
      }

      const isOtherSeatsForCurRow = findOtherSeatsForCurRow(sortedSeatSchema, curPos, idx)

      if (!isOtherSeatsForCurRow) {
        lastRow++
      }
    }

    if (lastSeatInCurRow) {
      addSeatToBooking(bookingSchema, {
        row: lastSeatInCurRow.row,
        col: lastSeatInCurRow.col + 1,
        type: curPos.type,
      })
      lastRow = lastSeatInCurRow.row
    }
  })

  return bookingSchema
}
