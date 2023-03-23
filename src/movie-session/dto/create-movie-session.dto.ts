import { ApiProperty } from '@nestjs/swagger'
import { MovieSession } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsDate } from 'class-validator'

export class CreateMovieSessionDto implements Omit<MovieSession, 'id'> {
  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  startDate: Date

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  endDate: Date

  @IsInt()
  @ApiProperty()
  movieId: number

  @IsInt()
  @ApiProperty()
  cinemaId: number
}
