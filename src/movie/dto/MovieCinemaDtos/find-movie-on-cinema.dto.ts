import { ApiProperty } from '@nestjs/swagger'
import { MovieOnCinema } from '@prisma/client'

export class FindMovieOnCinemaDto implements MovieOnCinema {
  @ApiProperty()
  cinemaId: number

  @ApiProperty()
  movieId: string
}
