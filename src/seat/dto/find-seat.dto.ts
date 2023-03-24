import { ApiProperty } from '@nestjs/swagger'
import { Seat } from '@prisma/client'
import { IsInt } from 'class-validator'
import { CreateSeatDto } from './create-seat.dto'

export class FindSeatDto extends CreateSeatDto implements Seat {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number
}
