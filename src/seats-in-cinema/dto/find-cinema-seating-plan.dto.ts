import { IsEnum, IsInt, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { SeatType } from '../../utils/seatsInCinema/types'

export class FindCinemaSeatingSchemaDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number

  @IsString()
  @IsEnum(SeatType)
  @ApiProperty({
    enumName: 'SeatType',
    enum: SeatType,
    example: SeatType.EMPTY,
  })
  type: SeatType
}
