import { Role } from '@prisma/client'

export type UnixDate = number

export type JwtPayload = {
  email: string
  sub: number
  role: Role
  iat: UnixDate
  exp: UnixDate
}
