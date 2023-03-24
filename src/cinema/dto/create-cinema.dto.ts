import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCinemaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty({ example: 'Dom Kino' })
  name: string

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty({ example: 'Plotnikova 42' })
  address: string

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty({ example: 'Minsk' })
  city: string
}
