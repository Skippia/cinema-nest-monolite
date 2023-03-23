import { ApiProperty } from '@nestjs/swagger'
import { MovieOnCinema } from '@prisma/client'
import { IsInt } from 'class-validator'

export class FindMovieInCinemaDto implements MovieOnCinema {
  @IsInt()
  @ApiProperty()
  cinemaId: number

  @IsInt()
  @ApiProperty()
  movieId: number
}
