import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Currency, MovieSession } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsDate, IsEnum, IsString, IsOptional } from 'class-validator'
import { CurrencyEnum } from '../../utils/types'

export class CreateMovieSessionDto implements Omit<MovieSession, 'id' | 'currency' | 'endDate'> {
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  startDate: Date

  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaId: number

  @IsInt()
  @ApiProperty({ example: 40 })
  price: number

  @IsString()
  @IsOptional()
  @IsEnum(Currency)
  @ApiPropertyOptional({
    enumName: 'CurrencyEnum',
    enum: CurrencyEnum,
    example: CurrencyEnum.USD,
  })
  currency?: Currency
}
