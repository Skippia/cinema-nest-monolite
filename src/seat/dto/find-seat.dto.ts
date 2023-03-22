import { ApiProperty } from '@nestjs/swagger'
import { Seat } from '@prisma/client'
import { IsInt } from 'class-validator'

export class FindSeatDto implements Seat {
  @IsInt()
  @ApiProperty()
  id: number

  @IsInt()
  @ApiProperty()
  row: number

  @IsInt()
  @ApiProperty()
  col: number
}
