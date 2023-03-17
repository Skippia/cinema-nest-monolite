import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateCinemaDto } from './dto/CinemaDtos/create-cinema.dto'
import { UpdateCinemaDto } from './dto/CinemaDtos/update-cinema.dto'

@Injectable()
export class CinemaService {
  constructor(private prisma: PrismaService) {}

  createCinema(cinemaData: CreateCinemaDto) {
    return this.prisma.cinema.create({ data: cinemaData })
  }

  findAllCinemas() {
    return this.prisma.cinema.findMany()
  }

  findOneCinema(id: number) {
    return this.prisma.cinema.findUnique({ where: { id } })
  }

  updateCinema(id: number, updateCinemaData: UpdateCinemaDto) {
    return this.prisma.cinema.update({
      where: { id },
      data: updateCinemaData,
    })
  }

  removeCinema(id: number) {
    return this.prisma.cinema.delete({ where: { id } })
  }
}
