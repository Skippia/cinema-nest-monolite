import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCinemaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty()
  name: string

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty()
  address: string

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @ApiProperty()
  city: string
}
