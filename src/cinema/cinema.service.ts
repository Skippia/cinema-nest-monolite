import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateCinemaDto } from './dto/CinemaDtos/create-cinema.dto'
import { UpdateCinemaDto } from './dto/CinemaDtos/update-cinema.dto'

@Injectable()
export class CinemaService {
  constructor(private prisma: PrismaService) {}

  async createCinema(cinemaData: CreateCinemaDto) {
    return await this.prisma.cinema.create({ data: cinemaData })
  }

  async findAllCinemas() {
    return await this.prisma.cinema.findMany()
  }

  async findOneCinema(id: number) {
    return await this.prisma.cinema.findUnique({ where: { id } })
  }

  async updateCinema(id: number, updateCinemaData: UpdateCinemaDto) {
    return await this.prisma.cinema.update({
      where: { id },
      data: updateCinemaData,
    })
  }

  async removeCinema(id: number) {
    return await this.prisma.cinema.delete({ where: { id } })
  }
}
