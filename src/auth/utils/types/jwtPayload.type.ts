import { Role } from '@prisma/client'

export type JwtPayload = {
  email: string
  sub: number
  role: Role
}
