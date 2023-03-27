import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class MovieIsAvailableForCinemaDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  isAvailable: boolean
}
