import { ApiProperty } from '@nestjs/swagger'
import { Cinema } from '@prisma/client'
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator'

export class FindCinemaDto implements Cinema {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

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
