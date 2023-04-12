import { TypeSeatEnum } from '@prisma/client'

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
