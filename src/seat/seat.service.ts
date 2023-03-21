import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  async createSeat(seatData: CreateSeatDto) {
    return await this.prisma.seat.create({ data: seatData })
  }

  async findAllSeats() {
    return await this.prisma.seat.findMany()
  }

  async findOneSeat(id: number) {
    return await this.prisma.seat.findUnique({ where: { id } })
  }

  async updateSeat(id: number, updateSeatData: UpdateSeatDto) {
    return await this.prisma.seat.update({
      where: { id },
      data: updateSeatData,
    })
  }

  async removeSeat(id: number) {
    return await this.prisma.seat.delete({ where: { id } })
  }
}
