import { TypeSeatEnum } from '@prisma/client'
import { ISeatPos } from '../seats-in-cinema/utils/types'

export type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never

const TypeSeatEmpty = {
  EMPTY: 'EMPTY',
} as const

export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  BYN = 'BYN',
  RUB = 'RUB',
}

export const TypeSeatEnumFull = { ...TypeSeatEnum, ...TypeSeatEmpty }

export type FullSeatType = keyof typeof TypeSeatEnum | 'EMPTY'

export type ISeatPosWithType = ISeatPos & { type: TypeSeatEnum }
export type IFullSeatPosWithType = ISeatPos & { type: FullSeatType }

export type ISeatsSchema = ISeatPosWithType[]
export type IFullSeatsSchema = IFullSeatPosWithType[]

export type IBookingSchema = (ISeatPosWithType & { isBooked: boolean })[]

export type IMergedFullCinemaBookingSeatingSchema = (ISeatPos & {
  type: FullSeatType
  bookingCol?: number
  bookingRow?: number
  isBooked?: boolean
})[]

export type IMergedCinemaBookingSeatingSchema = (ISeatPos & {
  bookingCol: number
  bookingRow: number
  isBooked: boolean
})[]
