import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function addSomeMovieRecords(
  prisma: PrismaService,
  imdbIds: string[],
): Promise<number[]> {
  const newMovieRecords = await Promise.all(
    imdbIds.map((imdbId) =>
      prisma.movieRecord.create({
        data: {
          imdbId,
        },
      }),
    ),
  )

  return newMovieRecords.map((movieRecord) => movieRecord.id)
}
