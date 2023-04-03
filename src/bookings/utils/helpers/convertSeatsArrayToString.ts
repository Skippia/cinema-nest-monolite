import { ISeatPos } from '../../../seats-in-cinema/utils/types'

export const convertSeatsArrayToString = (seats: ISeatPos[]) => {
  const resultWithTrim = seats.reduce((acc, cur) => {
    return `${acc}(row:${cur.row}, col:${cur.col}), `
  }, '')

  return resultWithTrim.slice(0, resultWithTrim.length - 2)
}
// ;`(row:4, col:5), (row:3, col:3)`
