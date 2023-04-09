import { Cinema } from '@prisma/client'
import { PrismaService } from '../../src/prisma/prisma.service'

export async function createCinemas(prisma: PrismaService): Promise<number[]> {
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
  const cinema3: Omit<Cinema, 'id'> = {
    name: 'Rodina',
    address: 'Leninskaya 4',
    city: 'Vitebsk',
  }

  const cinemas = await Promise.all(
    [cinema1, cinema2, cinema3].map((cinema) =>
      prisma.cinema.create({
        data: cinema,
      }),
    ),
  )

  return cinemas.map((cinema) => cinema.id)
}
