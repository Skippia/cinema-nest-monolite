import { ApiProperty } from '@nestjs/swagger'
import { TypeSeatEnum } from '@prisma/client'
import { IsInt, IsBoolean, IsString, IsEnum } from 'class-validator'
import { MergedFullCinemaBookingSeatingSchema } from '../../../common/types'
import { ArrElement } from '../../../common/types/utils'

export class FindMergedCinemaBookingSeatingSchemaDto
  implements ArrElement<MergedFullCinemaBookingSeatingSchema>
{
  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number

  @IsInt()
  @ApiProperty({ example: 1 })
  bookingCol: number

  @IsInt()
  @ApiProperty({ example: 1 })
  bookingRow: number

  @IsBoolean()
  @ApiProperty({ example: true })
  isBooked: boolean

  @IsString()
  @IsEnum(TypeSeatEnum)
  @ApiProperty({
    enumName: 'TypeSeatEnum',
    enum: TypeSeatEnum,
    example: TypeSeatEnum.SEAT,
  })
  type: TypeSeatEnum
}
