import { Injectable } from '@nestjs/common'
import { Cinema } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCinemaDto } from './dto/create-cinema.dto'
import { UpdateCinemaDto } from './dto/update-cinema.dto'

@Injectable()
export class CinemaService {
  constructor(private readonly prisma: PrismaService) {}

  async createCinema(cinemaData: CreateCinemaDto): Promise<Cinema> {
    return await this.prisma.cinema.create({ data: cinemaData })
  }

  async findAllCinemas(): Promise<Cinema[]> {
    return await this.prisma.cinema.findMany()
  }

  async findOneCinema(id: number): Promise<Cinema | null> {
    return await this.prisma.cinema.findUnique({ where: { id } })
  }

  async updateCinema(id: number, updateCinemaData: UpdateCinemaDto): Promise<Cinema> {
    return await this.prisma.cinema.update({
      where: { id },
      data: updateCinemaData,
    })
  }

  async removeCinema(id: number): Promise<Cinema> {
    return await this.prisma.cinema.delete({ where: { id } })
  }
}
