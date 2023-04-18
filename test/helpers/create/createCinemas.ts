import { Cinema } from '@prisma/client'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function createCinemas(prisma: PrismaService) {
  const cinema1: Omit<Cinema, 'id'> = {
    name: 'Dom Kino',
    address: 'Talbuchina 18',
    city: 'Minsk',
  }

  const cinema2: Omit<Cinema, 'id'> = {
    name: 'Aurora',
    address: 'Prytyckaha 23',
    city: 'Minsk',
  }

  const cinemas = await Promise.all(
    [cinema1, cinema2].map((cinema) =>
      prisma.cinema.create({
        data: cinema,
      }),
    ),
  )

  return cinemas
}
