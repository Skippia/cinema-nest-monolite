import { SeatPos } from 'src/modules/seats-in-cinema-hall/utils/types'

export const convertSeatsArrayToString = (seats: SeatPos[]) => {
  const resultWithTrim = seats.reduce((acc, cur) => {
    return `${acc}(row:${cur.row}, col:${cur.col}), `
  }, '')

  return resultWithTrim.slice(0, resultWithTrim.length - 2)
}
// ;`(row:4, col:5), (row:3, col:3)`
