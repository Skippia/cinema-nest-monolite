import { Booking, Currency } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { SeatPos } from '../dto/create-booking.dto'
import { CurrencyEnum, ISeatPosWithType } from '../../utils/types'

export class BookingEntity {
  constructor(seatsForBooking: ISeatPosWithType[], booking: Booking) {
    const { id, userId, totalPrice, currency, movieSessionId, createdAt } = booking

    this.id = id
    this.userId = userId
    this.totalPrice = totalPrice
    this.currency = currency
    this.movieSessionId = movieSessionId
    this.createdAt = createdAt
    this.seats = seatsForBooking
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

  @IsInt()
  @ApiProperty({ example: 1 })
  userId: number

  @IsInt()
  @ApiProperty({ example: 200 })
  totalPrice: number

  @IsString()
  @IsEnum(Currency)
  @ApiProperty({
    enumName: 'CurrencyEnum',
    enum: CurrencyEnum,
    example: CurrencyEnum.USD,
  })
  currency: Currency

  @IsInt()
  @ApiProperty({ example: 1 })
  movieSessionId: number

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  createdAt: Date

  @ValidateNested({ each: true })
  @Type(() => SeatPos)
  @IsArray()
  @ApiProperty({ isArray: true, type: SeatPos })
  seats: SeatPos[]
}
