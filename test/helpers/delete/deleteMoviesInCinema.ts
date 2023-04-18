import { PrismaService } from 'src/modules/prisma/prisma.service'

export const deleteMoviesInCinema = (prisma: PrismaService, cinemaId: number) =>
  prisma.movieOnCinema.deleteMany({
    where: {
      cinemaId,
    },
  })
