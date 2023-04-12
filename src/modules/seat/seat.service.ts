import { Injectable } from '@nestjs/common'
import { Seat, TypeSeatEnum } from '@prisma/client'
import { SeatPosWithType } from 'src/common/types'
import { PrismaService } from '../prisma/prisma.service'
import { SeatPos } from '../seats-in-cinema/utils/types'
import { CreateSeatDto, UpdateSeatDto } from './dto'

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

  async findSeatTypeIdBySeatType(typeSeatName: TypeSeatEnum): Promise<{ id: number }> {
    return await this.prisma.typeSeat.findUniqueOrThrow({
      where: { type: typeSeatName },
      select: {
        id: true,
      },
    })
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

  async replaceSeatsPositionsToRealOrCreateSeats(
    seats: SeatPosWithType[],
  ): Promise<(SeatPosWithType & { id: number })[]> {
    const realSeats = [] as (SeatPosWithType & { id: number })[]

    for (const { col, row, type } of seats) {
      /**
       * Try to get all needed seats according to the seat schema
       */
      let realSeat = await this.prisma.seat.findUnique({
        where: {
          row_col: {
            col,
            row,
          },
        },
      })

      /**
       * If such seat yet doesn't exist - create it
       */
      if (!realSeat) {
        realSeat = await this.prisma.seat.create({
          data: { col, row },
        })
      }

      realSeats.push({ ...realSeat, type })
    }

    return realSeats
  }

  async convertSeatsPositionsToRealSeats(seatsPositions: SeatPos[]): Promise<Seat[]> {
    return await Promise.all(
      seatsPositions.map(({ row, col }) =>
        this.prisma.seat.findUniqueOrThrow({
          where: {
            row_col: {
              row,
              col,
            },
          },
        }),
      ),
    )
  }
}
