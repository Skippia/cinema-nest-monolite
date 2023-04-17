import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator'
import { SeatPosDto, SeatPosWithTypeDto } from 'src/modules/bookings/dto'
import { HallTypeEnum } from 'src/modules/seats-in-cinema-hall/utils/types'

export class FindCinemaHallWithSchemaDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Aurora big hall' })
  name: string

  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaId: number

  @IsString()
  @IsEnum(HallTypeEnum)
  @ApiProperty({
    enumName: 'HallTypeEnum',
    enum: HallTypeEnum,
    example: HallTypeEnum['2D'],
  })
  hallType: HallTypeEnum

  @ValidateNested({ each: true })
  @Type(() => SeatPosDto)
  @IsArray()
  @ApiProperty({ isArray: true, type: SeatPosDto })
  schema: SeatPosWithTypeDto[]
}
