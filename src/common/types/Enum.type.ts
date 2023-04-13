import { TypeSeatEnum } from '@prisma/client'

const TypeSeatEmpty = {
  EMPTY: 'EMPTY',
} as const

export const TypeSeatEnumFull = { ...TypeSeatEnum, ...TypeSeatEmpty }
