import { ApiProperty } from '@nestjs/swagger'
import { MovieOnCinema } from '@prisma/client'
import { IsInt } from 'class-validator'

export class MovieInCinemaEntity implements MovieOnCinema {
  constructor(movieOnCinema: MovieOnCinema) {
    this.cinemaId = movieOnCinema.cinemaId
    this.movieId = movieOnCinema.movieId
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number
}
