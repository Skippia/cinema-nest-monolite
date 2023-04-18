import { SeatPos } from '../types'

export function generateSeatsOnRectangle(colLength: number, rowLength: number): SeatPos[] {
  const array = []
  for (let x = 1; x <= colLength; x++) {
    for (let y = 1; y <= rowLength; y++) {
      array.push({ col: x, row: y })
    }
  }
  return array
}
