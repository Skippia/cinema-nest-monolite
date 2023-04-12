import { IsEnum, IsInt, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { TypeSeatEnum } from '@prisma/client'
import { SeatPosWithType } from 'src/common/types'

export class SeatWithTypeEntity implements SeatPosWithType {
  constructor(seatWithType: SeatPosWithType) {
    this.col = seatWithType.col
    this.row = seatWithType.row
    this.type = seatWithType.type
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number

  @IsString()
  @IsEnum(TypeSeatEnum)
  @ApiProperty({
    enumName: 'SeatType',
    enum: TypeSeatEnum,
    example: TypeSeatEnum.SEAT,
  })
  type: TypeSeatEnum
}
