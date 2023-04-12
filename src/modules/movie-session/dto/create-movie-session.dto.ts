import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MovieSession, Currency, TypeSeatEnum } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsInt, IsString, IsOptional, IsEnum, IsObject, isNumber } from 'class-validator'
import { CurrencyEnum } from 'src/common/types'
import { IsRecord } from 'src/common/validators'

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

  @IsObject()
  @IsRecord(TypeSeatEnum, isNumber, {
    message: "priceFactors doesn't correspond to type Record<TypeSeatEnum, number>",
  })
  @ApiProperty({
    example: Object.keys(TypeSeatEnum).reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: acc[Object.keys(acc).at(-1) as keyof typeof acc] * 1.5 || 1,
      }
    }, {} as Record<TypeSeatEnum, number>),
    description: 'Price multipliers for each type of seat.',
  })
  priceFactors: Record<TypeSeatEnum, number>
}
