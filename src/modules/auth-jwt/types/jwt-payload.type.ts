import { Role } from '@prisma/client'
import { UnixDate } from 'src/common/types/UnixDate.type'

export type JwtPayload = {
  email: string
  sub: number
  role: Role
  iat: UnixDate
  exp: UnixDate
}
