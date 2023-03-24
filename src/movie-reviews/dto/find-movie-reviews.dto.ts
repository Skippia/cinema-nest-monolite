import { IsString, ValidateNested, IsArray, IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class Author {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string
}

class InterestingVotes {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  down?: number

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
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
  @ApiProperty()
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string

  @Type(() => Date)
  @IsDateString()
  @ApiProperty()
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
