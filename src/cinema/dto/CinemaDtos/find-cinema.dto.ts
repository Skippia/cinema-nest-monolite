import { ApiProperty } from '@nestjs/swagger'
import { Cinema } from '@prisma/client'
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator'

export class FindCinemaDto implements Cinema {
  @IsInt()
  @ApiProperty()
  id: number

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
