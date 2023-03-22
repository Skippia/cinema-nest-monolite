import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty } from 'class-validator'

export class AddMovieToCinemaDto {
  @IsInt()
  @ApiProperty()
  cinemaId: number

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String })
  movieIds: string[]
}
