import { ApiProperty } from '@nestjs/swagger'
import { MovieOnCinema } from '@prisma/client'
import { IsInt } from 'class-validator'

export class FindMovieInCinemaDto implements MovieOnCinema {
  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number
}
