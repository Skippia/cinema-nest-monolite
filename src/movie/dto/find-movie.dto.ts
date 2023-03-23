import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class FindMovieDto {
  @IsInt()
  @ApiProperty()
  id: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  releaseYear: number

  @IsNumber()
  @ApiProperty()
  rating: number

  @IsInt()
  @ApiProperty()
  duration: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  image: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  trailer: string

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String })
  countries: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String })
  actors: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String })
  genres: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String })
  authors: string[]
}
