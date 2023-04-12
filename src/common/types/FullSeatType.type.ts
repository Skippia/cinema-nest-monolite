import { TypeSeatEnum } from '@prisma/client'

export type FullSeatType = keyof typeof TypeSeatEnum | 'EMPTY'
