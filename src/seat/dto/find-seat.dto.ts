import { ApiProperty } from '@nestjs/swagger'
import { Seat } from '@prisma/client'
import { IsInt } from 'class-validator'

export class FindSeatDto implements Seat {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number

  @IsInt()
  @ApiProperty({ example: 1 })
  col: number
}
