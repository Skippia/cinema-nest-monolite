import { ApiProperty } from '@nestjs/swagger'
import { TypeSeatEnum } from '@prisma/client'
import { IsInt, IsString, IsEnum } from 'class-validator'
import { SeatPosWithType } from 'src/common/types'

export class FindSeatBookingDto implements SeatPosWithType {
  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number

  @IsString()
  @IsEnum(TypeSeatEnum)
  @ApiProperty({
    enumName: 'TypeSeatEnum',
    enum: TypeSeatEnum,
    example: TypeSeatEnum.SEAT,
  })
  type: TypeSeatEnum
}
