import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function addSomeMovieRecords(
  prisma: PrismaService,
  imdbIds: string[],
): Promise<number[]> {
  const newMovieRecords = await prisma.$transaction(
    imdbIds.map((imdbId, idx) =>
      prisma.movieRecord.create({
        data: {
          id: idx + 1,
          imdbId,
        },
      }),
    ),
  )

  return newMovieRecords.map((movieRecord) => movieRecord.id)
}
