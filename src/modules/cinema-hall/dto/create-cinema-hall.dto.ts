import { ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsString, IsEnum } from 'class-validator'
import { HallTypeEnum } from '../../seats-in-cinema-hall/utils/types'
import { CreateCinemaHallSeatingSchemaDto } from '../../seats-in-cinema-hall/dto/create-cinema-hall-seating-plan.dto'

export class CreateCinemaHallDto
  extends CreateCinemaHallSeatingSchemaDto
  implements Omit<Prisma.CinemaHallUncheckedCreateInput, 'cinemaId'>
{
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Aurora big hall' })
  name: string

  @IsString()
  @IsEnum(HallTypeEnum)
  @ApiProperty({
    enumName: 'HallTypeEnum',
    enum: HallTypeEnum,
    example: HallTypeEnum['2D'],
  })
  hallType: HallTypeEnum
}
