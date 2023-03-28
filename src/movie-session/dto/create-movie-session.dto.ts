import { ApiProperty } from '@nestjs/swagger'
import { MovieSession } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsDate } from 'class-validator'

export class CreateMovieSessionDto implements Omit<MovieSession, 'id' | 'endDate'> {
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  startDate: Date

  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaId: number
}
