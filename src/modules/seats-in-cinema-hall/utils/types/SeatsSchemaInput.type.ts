import { MatrixSeatPos } from './MatrixSeatPos.type'
import { SeatPos } from './SeatPos.type'

export interface SeatsSchemaInput {
  colLength: number
  rowLength: number
  positionsExclude?: SeatPos[]
  areasExclude?: MatrixSeatPos[]
  vipSeats?: SeatPos[]
  loveSeats?: SeatPos[]
}
