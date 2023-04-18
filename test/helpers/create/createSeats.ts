import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function createSeats(prisma: PrismaService) {
  const colLength = 10
  const rowLength = 10

  const dataSeat = [] as { col: number; row: number }[]

  for (let x = 1; x <= colLength; x++) {
    for (let y = 1; y <= rowLength; y++) {
      dataSeat.push({ col: x, row: y })
    }
  }

  await prisma.seat.createMany({ data: dataSeat })
}
