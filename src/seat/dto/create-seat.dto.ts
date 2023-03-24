import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class CreateSeatDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number
}
