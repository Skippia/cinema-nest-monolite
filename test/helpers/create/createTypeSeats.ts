import { TypeSeatEnum } from '@prisma/client'
import { PrismaService } from 'src/modules/prisma/prisma.service'

export async function createTypeSeats(prisma: PrismaService) {
  await prisma.typeSeat.createMany({
    data: [{ type: TypeSeatEnum.SEAT }, { type: TypeSeatEnum.VIP }, { type: TypeSeatEnum.LOVE }],
  })
}
