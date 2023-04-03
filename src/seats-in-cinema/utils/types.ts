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
  vipSeats?: ISeatPos[]
  loveSeats?: ISeatPos[]
}
