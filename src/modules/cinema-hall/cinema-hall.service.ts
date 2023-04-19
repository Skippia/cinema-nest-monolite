import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CinemaHallService {
  constructor(private readonly prisma: PrismaService) {}

  async createCinemaHall(data: Prisma.CinemaHallUncheckedCreateInput) {
    const newCinemaHall = await this.prisma.cinemaHall.create({
      data,
    })

    return newCinemaHall
  }

  async deleteCinemaHallById(cinemaHallId: number) {
    const deletedCinemaHall = await this.prisma.cinemaHall.delete({
      where: {
        id: cinemaHallId,
      },
    })

    return deletedCinemaHall
  }

  async findOneCinemaHall(uniqueCriteria: Prisma.CinemaHallWhereUniqueInput) {
    const deletedCinemaHall = await this.prisma.cinemaHall.findUnique({
      where: uniqueCriteria,
    })

    return deletedCinemaHall
  }
}
