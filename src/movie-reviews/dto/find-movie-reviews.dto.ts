import { IsString, ValidateNested, IsArray, IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class Author {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'TheLittleSongbird' })
  name: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '/user/ur20552756/' })
  id: string
}

class InterestingVotes {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 29 })
  down?: number

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 93 })
  up?: number
}

class Review {
  @ValidateNested()
  @Type(() => Author)
  @ApiProperty()
  author: Author

  @ValidateNested()
  @Type(() => InterestingVotes)
  @ApiProperty()
  interestingVotes: InterestingVotes

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'You love it or  you hate it, personally I loved it' })
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'Perhaps a little too long, but Fight Club is just a very well-made, brilliantly written and superlatively...',
  })
  text: string

  @Type(() => Date)
  @IsDateString()
  @ApiProperty({ example: '2021-06-15' })
  date: Date
}

export class FindMovieReviewsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string

  @ValidateNested({ each: true })
  @Type(() => Review)
  @IsArray()
  @ApiProperty({ isArray: true, type: Review })
  reviews: Review[]
}
