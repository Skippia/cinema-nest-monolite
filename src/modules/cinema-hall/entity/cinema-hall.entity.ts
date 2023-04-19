import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CinemaHall } from '@prisma/client'
import { HallTypeEnum } from '../../seats-in-cinema-hall/utils/types'

export class CinemaHallEntity implements CinemaHall {
  constructor(cinemaHallWithSchema: CinemaHall) {
    this.id = cinemaHallWithSchema.id
    this.name = cinemaHallWithSchema.name
    this.cinemaId = cinemaHallWithSchema.cinemaId
    this.hallType = cinemaHallWithSchema.hallType as HallTypeEnum
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
}
