import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Movie } from '../types/movie.type'

export class MovieEntity {
  constructor(movie: Movie) {
    this.title = movie.title
    this.rating = movie.rating
    this.releaseYear = movie.releaseYear
    this.image = movie.image
    this.description = movie.description
    this.trailer = movie.trailer
    this.genres = movie.genres
    this.authors = movie.authors
    this.writers = movie.writers
    this.id = movie.id
    this.actors = movie.actors
    this.duration = movie.duration
    this.countries = movie.countries
  }

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 'tt0111161' })
  id: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'The Shawshank Redemption' })
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  })
  description: string

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1994 })
  releaseYear: number

  @IsNumber()
  @ApiProperty({ example: 9.3 })
  rating: number

  @IsInt()
  @ApiProperty({ example: 146 })
  duration: number

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_QL75_UX380_CR0,1,380,562_.jpg',
  })
  image: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'https://storage.yandexcloud.net/bucket-midapa/The%20Shawshank%20Redemption%20(1994)%20Official%20Trailer%20%231%20-%20Morgan%20Freeman%20Movie%20HD.mp4',
  })
  trailer: string

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String, example: ['Spain'] })
  countries: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({
    isArray: true,
    type: String,
    example: [
      'Tim Robbins',
      'Morgan Freeman',
      'Bob Gunton',
      'William Sadler',
      'Clancy Brown',
      'Gil Bellows',
      'Mark Rolston',
      'James Whitmore',
      'Jeffrey DeMunn',
      'Larry Brandenburg',
      'Neil Giuntoli',
      'Brian Libby',
      'David Proval',
      'Joseph Ragno',
      'Jude Ciccolella',
      'Paul McCrane',
      'Renee Blaine',
      'Scott Mann',
    ],
  })
  actors: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String, example: ['Drama'] })
  genres: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String, example: ['Stephen King'] })
  writers: string[]

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ isArray: true, type: String, example: ['Frank Darabont'] })
  authors: string[]
}
