import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MovieSession, CurrencyEnum } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsDate, IsString, IsEnum, IsOptional } from 'class-validator'
import { HallTypeEnum } from '../../../modules/seats-in-cinema-hall/utils/types'

export class MovieSessionEntity implements MovieSession {
  constructor(
    movieSession: MovieSession & { hallType: HallTypeEnum; amountAvailableSeats?: number },
  ) {
    this.id = movieSession.id
    this.startDate = movieSession.startDate
    this.endDate = movieSession.endDate
    this.movieId = movieSession.movieId
    this.cinemaHallId = movieSession.cinemaHallId
    this.price = movieSession.price
    this.currency = movieSession.currency
    this.hallType = movieSession?.hallType
    this.amountAvailableSeats = movieSession?.amountAvailableSeats
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  startDate: Date

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  endDate: Date

  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number

  @IsInt()
  @ApiProperty({ example: 1 })
  cinemaHallId: number

  @IsInt()
  @ApiProperty({ example: 40 })
  price: number

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 5 })
  amountAvailableSeats?: number

  @IsString()
  @IsEnum(CurrencyEnum)
  @ApiProperty({
    enumName: 'CurrencyEnum',
    enum: CurrencyEnum,
    example: CurrencyEnum.USD,
  })
  currency: CurrencyEnum

  @IsString()
  @IsOptional()
  @IsEnum(HallTypeEnum)
  @ApiPropertyOptional({
    enumName: 'HallTypeEnum',
    enum: HallTypeEnum,
    example: HallTypeEnum['2D'],
  })
  hallType?: HallTypeEnum
}
