import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class CreateSeatDto {
  @IsInt()
  @ApiProperty()
  col: number

  @IsInt()
  @ApiProperty()
  row: number
}
