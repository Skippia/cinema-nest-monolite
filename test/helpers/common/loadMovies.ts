import movies from '../../../data/movies.json'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function loadMovies(prisma: PrismaService) {
  const movieIds = movies.map((m) => ({ imdbId: m.imdbId }))

  await prisma.movieRecord.createMany({
    data: movieIds,
  })
}
