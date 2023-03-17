import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSeatDto } from './dto/create-seat.dto'
import { UpdateSeatDto } from './dto/update-seat.dto'

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  createSeat(seatData: CreateSeatDto) {
    return this.prisma.seat.create({ data: seatData })
  }

  findAllSeats() {
    return this.prisma.seat.findMany()
  }

  findOneSeat(id: number) {
    return this.prisma.seat.findUnique({ where: { id } })
  }

  updateSeat(id: number, updateSeatData: UpdateSeatDto) {
    return this.prisma.seat.update({
      where: { id },
      data: updateSeatData,
    })
  }

  removeSeat(id: number) {
    return this.prisma.seat.delete({ where: { id } })
  }
}
