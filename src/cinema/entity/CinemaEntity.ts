import { ApiProperty } from '@nestjs/swagger'
import { Cinema } from '@prisma/client'
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator'

export class CinemaEntity implements Cinema {
  constructor(cinema: Cinema) {
    this.id = cinema.id
    this.name = cinema.name
    this.address = cinema.address
    this.city = cinema.city
  }

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
