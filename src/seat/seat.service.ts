import { Injectable } from '@nestjs/common'
import { Seat } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'

@Injectable()
export class SeatService {
  constructor(private readonly prisma: PrismaService) {}

  async createSeat(seatData: CreateSeatDto): Promise<Seat> {
    return await this.prisma.seat.create({ data: seatData })
  }

  async findAllSeats(): Promise<Seat[]> {
    return await this.prisma.seat.findMany()
  }

  async findOneSeat(id: number): Promise<Seat | null> {
    return await this.prisma.seat.findUnique({ where: { id } })
  }

  async updateSeat(id: number, updateSeatData: UpdateSeatDto): Promise<Seat> {
    return await this.prisma.seat.update({
      where: { id },
      data: updateSeatData,
    })
  }

  async deleteSeat(id: number): Promise<Seat> {
    return await this.prisma.seat.delete({ where: { id } })
  }
}
