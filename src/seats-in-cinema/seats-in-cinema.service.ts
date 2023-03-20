import { Injectable } from '@nestjs/common'
import { Seat, SeatOnCinema } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { generateSeatSchema, recoverySeatSchema } from '../utils/seatsInCinema/helpers'
import { ISeatPos, ISeatSchemaOutput } from '../utils/seatsInCinema/types'
import { CreateCinemaSeatingSchemaDto } from './dto/create-cinema-seating-plan.dto'

@Injectable()
export class SeatsOnCinemaService {
  constructor(private prisma: PrismaService) {}

  async createCinemaSeatingSchema(
    cinemaId: number,
    seatsSchemaData: CreateCinemaSeatingSchemaDto,
  ): Promise<ISeatSchemaOutput> {
    /**
     * Generate seats schema with seats (only seats, without empties)
     */
    const seatsSchema = generateSeatSchema(seatsSchemaData)

    /**
     * Replace seats to real seats from db
     */
    const realSeatsSchema = await this.replacePositionsToRealSeats(seatsSchema)

    /**
     * Add generated seats from realSeatsSchema to cinema (db)
     */
    const generatedSeats = await this.addSeatsSchemaToCinema(cinemaId, realSeatsSchema)

    /**
     * Recover information about empties and return it
     */
    return recoverySeatSchema(generatedSeats)
  }

  /**
   * Helper for createCinemaSeatingSchema
   */
  async addSeatsSchemaToCinema(cinemaId: number, seats: Seat[]): Promise<ISeatPos[]> {
    const seatCinemaElements = seats.reduce((acc, cur) => [...acc, { cinemaId, seatId: cur.id }], [] as SeatOnCinema[])

    /**
     * In createMany is impossible to return created records
     * */
    const data = await this.prisma.$transaction(
      seatCinemaElements.map((seatCinemaElement) =>
        this.prisma.seatOnCinema.create({
          data: seatCinemaElement,
          include: {
            seat: true,
          },
        }),
      ),
    )
    return data.map((seatFull) => ({
      row: seatFull.seat.row,
      col: seatFull.seat.col,
    }))
  }

  /**
   * Helper for createCinemaSeatingSchema
   */
  async replacePositionsToRealSeats(seats: ISeatPos[]): Promise<Seat[]> {
    const realSeats: Seat[] = []

    for (const { col, row } of seats) {
      /**
       * Try to get all needed seats accrording to the seat schema
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

      realSeats.push(realSeat)
    }

    return realSeats
  }

  async findCinemaSeatingSchema(cinemaId: number) {
    const seats = await this.prisma.seatOnCinema.findMany({
      where: {
        cinemaId,
      },
      include: {
        seat: true,
      },
    })

    return recoverySeatSchema(
      seats.map((seatFull) => ({
        row: seatFull.seat.row,
        col: seatFull.seat.col,
      })),
    )
  }

  resetCinemaSeatingSchema(cinemaId: number) {
    return this.prisma.seatOnCinema.deleteMany({
      where: {
        cinemaId,
      },
    })
  }
}
