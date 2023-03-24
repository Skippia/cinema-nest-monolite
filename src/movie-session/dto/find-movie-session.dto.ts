import { ApiProperty } from '@nestjs/swagger'
import { MovieSession } from '@prisma/client'
import { IsInt } from 'class-validator'
import { CreateMovieSessionDto } from './create-movie-session.dto'

export class FindMovieSessionDto extends CreateMovieSessionDto implements MovieSession {
  @IsInt()
  @ApiProperty({ example: 1 })
  id: number
}
