import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { TypeSeatEnum } from '@prisma/client'

export class SeatPosWithTypeDto {
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

export class SeatPosDto {
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
  movieSessionId: number

  @ValidateNested({ each: true })
  @Type(() => SeatPosDto)
  @IsArray()
  @ApiProperty({ isArray: true, type: SeatPosDto })
  desiredSeats: SeatPosWithTypeDto[]
}
