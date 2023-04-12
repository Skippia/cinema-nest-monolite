import { ApiProperty } from '@nestjs/swagger'
import { Seat } from '@prisma/client'
import { IsInt } from 'class-validator'

export class SeatEntity implements Omit<Seat, 'id'> {
  constructor(seat: Seat) {
    this.col = seat.col
    this.row = seat.row
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number
}
