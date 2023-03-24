import { ApiProperty } from '@nestjs/swagger'
import { Cinema } from '@prisma/client'
import { IsInt } from 'class-validator'
import { CreateCinemaDto } from './create-cinema.dto'

export class FindCinemaDto extends CreateCinemaDto implements Cinema {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number
}
