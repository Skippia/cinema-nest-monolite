import { ApiProperty } from '@nestjs/swagger'
import { CinemaHall } from '@prisma/client'
import { IsNotEmpty, IsString, IsInt, IsEnum } from 'class-validator'
import { HallTypeEnum } from 'src/modules/seats-in-cinema-hall/utils/types'

export class FindCinemaHallDto implements CinemaHall {
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
