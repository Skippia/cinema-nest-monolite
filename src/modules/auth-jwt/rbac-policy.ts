import { RoleEnum } from '@prisma/client'
import { RolesBuilder } from 'nest-access-control'

export const RBAC_POLICY: RolesBuilder = new RolesBuilder()

// prettier-ignore
RBAC_POLICY
  .grant(RoleEnum.USER)
  .createOwn('bookingData')
  .readOwn(['bookingData', 'userData'])
  .updateOwn('userData')
  .deleteOwn(['bookingData', 'userData'])
  .grant(RoleEnum.OWNER)
  .extend(RoleEnum.USER)
  .createAny([
    'cinemaData',
    'cinemaHallData',
    'movieSessionData',
    'moviesInCinemaData',
    'movieData',
    'seatData',
    'seatsInCinemaData',
  ])
  .readAny(['bookingData', 'userData'])
  .grant(RoleEnum.ADMIN)
  .extend(RoleEnum.OWNER)
  .deleteAny(['userData'])
