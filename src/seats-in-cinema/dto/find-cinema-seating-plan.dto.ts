import { IsEnum, IsInt, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { SeatType } from 'src/utils/seatsInCinema/types'

export class FindCinemaSeatingSchemaDto {
  @IsInt()
  @ApiProperty()
  col: number

  @IsInt()
  @ApiProperty()
  row: number

  @IsString()
  @IsEnum(SeatType)
  @ApiProperty({ enumName: 'SeatType', enum: SeatType })
  type: SeatType
}
