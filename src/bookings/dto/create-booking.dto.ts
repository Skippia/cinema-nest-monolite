import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { TypeSeatEnum } from '@prisma/client'

export class SeatPos {
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

export class _SeatPos {
  @IsInt()
  @ApiProperty({ example: 1 })
  col: number

  @IsInt()
  @ApiProperty({ example: 1 })
  row: number
}

export class CreateBookingDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  userId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  movieSessionId: number

  @ValidateNested({ each: true })
  @Type(() => _SeatPos)
  @IsArray()
  @ApiProperty({ isArray: true, type: _SeatPos })
  desiredSeats: _SeatPos[]
}
