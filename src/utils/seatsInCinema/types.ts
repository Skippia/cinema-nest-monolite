export interface ISeatPos {
  col: number
  row: number
}

export interface IMatrixSeatPos {
  colStart: number
  colEnd: number
  rowStart: number
  rowEnd: number
}

export interface ISeatsSchemaInput {
  colLength: number
  rowLength: number
  positionsExclude?: ISeatPos[]
  areasExclude?: IMatrixSeatPos[]
}

export enum SeatType {
  SEAT = 'SEAT',
  EMPTY = 'EMPTY',
}

export type ISeatSchemaOutput = (ISeatPos & { type: SeatType })[]

export type IBookingSchema = (ISeatPos & { isBooked: boolean })[]

export type IFullSeatSchema = (ISeatPos & {
  type: SeatType
  bookingCol?: number
  bookingRow?: number
  isBooked?: boolean
})[]
