import { ApiProperty } from '@nestjs/swagger'
import { MovieSession } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsString, IsNotEmpty, IsDate } from 'class-validator'

export class FindMovieSessionDto implements MovieSession {
  @IsInt()
  @ApiProperty()
  id: number

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  startDate: Date

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  endDate: Date

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  movieId: string

  @IsInt()
  @ApiProperty()
  cinemaId: number
}
