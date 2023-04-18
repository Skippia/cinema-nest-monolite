import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CinemaHall } from '@prisma/client'
import { SeatsSchema } from 'src/common/types'
import { HallTypeEnum } from 'src/modules/seats-in-cinema-hall/utils/types'
import { Type } from 'class-transformer'
import { SeatPosDto, SeatPosWithTypeDto } from 'src/modules/bookings/dto'

export type CinemaHallWithSchema = CinemaHall & { schema: SeatsSchema }

export class CinemaHallWithSchemaEntity implements CinemaHallWithSchema {
  constructor(cinemaHallWithSchema: CinemaHallWithSchema) {
    this.id = cinemaHallWithSchema.id
    this.name = cinemaHallWithSchema.name
    this.cinemaId = cinemaHallWithSchema.cinemaId
    this.hallType = cinemaHallWithSchema.hallType as HallTypeEnum
    this.schema = cinemaHallWithSchema.schema
  }
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
