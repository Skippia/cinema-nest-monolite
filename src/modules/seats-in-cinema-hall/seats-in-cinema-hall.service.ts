import { Injectable } from '@nestjs/common'
import { TypeSeatEnum, Seat, SeatOnCinemaHall } from '@prisma/client'
import { SeatsSchema, SeatPosWithType } from '../../common/types'
import { PrismaService } from '../prisma/prisma.service'
import { SeatService } from '../seat/seat.service'
import { CreateCinemaHallSeatingSchemaDto } from './dto'
import { generateBaseSeatSchema } from './utils/helpers'
import {
  ChainSeatsOverrider,
  overrideWithLoveSeats,
  overrideWithVipSeats,
} from './utils/helpers/OverrideSeats'

@Injectable()
export class SeatsInCinemaHallService {
  constructor(private readonly prisma: PrismaService, private readonly seatService: SeatService) {}

  async createCinemaHallSeatingSchema(
    cinemaHallId: number,
    seatsSchemaData: CreateCinemaHallSeatingSchemaDto,
  ): Promise<SeatsSchema> {
    const { vipSeats = [], loveSeats = [] } = seatsSchemaData
    // Generate seats schema (only seats, without empties)
    const basedSeatsSchema = generateBaseSeatSchema(seatsSchemaData)

    const chainSeatsOverrider = new ChainSeatsOverrider({
      source: basedSeatsSchema,
      mappers: [overrideWithVipSeats(vipSeats), overrideWithLoveSeats(loveSeats)],
    })

    // Override default seats by vip, love seats from input
    const processedSchema = chainSeatsOverrider.run()

    // Replace seats for real seats or create
    const realSeatsSchema = await this.seatService.replaceSeatsPositionsToRealOrCreateSeats(
      processedSchema,
    )

    const { id: defaultSeatTypeId } = await this.seatService.findSeatTypeIdBySeatType(
      TypeSeatEnum.SEAT,
    )
    const { id: vipSeatTypeId } = await this.seatService.findSeatTypeIdBySeatType(TypeSeatEnum.VIP)
    const { id: loveSeatTypeId } = await this.seatService.findSeatTypeIdBySeatType(
      TypeSeatEnum.LOVE,
    )

    // Add generated seats from realSeatsSchema to cinema hall (db)
    const addedSeatsToCinemaHallArray = await this.addSeatsToCinemaHallByType(cinemaHallId, [
      {
        schema: realSeatsSchema.filter((e) => e.type === TypeSeatEnum.SEAT),
        typeSeatId: defaultSeatTypeId,
      },
      {
        schema: realSeatsSchema.filter((e) => e.type === TypeSeatEnum.VIP),
        typeSeatId: vipSeatTypeId,
      },
      {
        schema: realSeatsSchema.filter((e) => e.type === TypeSeatEnum.LOVE),
        typeSeatId: loveSeatTypeId,
      },
    ])

    return addedSeatsToCinemaHallArray
  }

  async addSeatsToCinemaHallByType(
    cinemaHallId: number,
    data: {
      schema: (SeatPosWithType & { id: number })[]
      typeSeatId: number
    }[],
  ): Promise<SeatPosWithType[]> {
    //TODO? Replace with $transaction
    const addedSeatsToCinemaHallDoubleArray = await Promise.all(
      data.map((el) => this.addSeatsSchemaToCinemaHall(cinemaHallId, el.schema, el.typeSeatId)),
    )
    const addedSeatsToCinemaHallArray = addedSeatsToCinemaHallDoubleArray.flatMap((el) => el)

    return addedSeatsToCinemaHallArray
  }

  async addSeatsSchemaToCinemaHall(
    cinemaHallId: number,
    seats: Seat[],
    typeSeatId: number,
  ): Promise<SeatPosWithType[]> {
    const seatCinemaElements = seats.reduce(
      (acc, seat) => [...acc, { cinemaHallId, seatId: seat.id, typeSeatId }],
      [] as SeatOnCinemaHall[],
    )

    // In createMany is impossible to return created records
    const data = await this.prisma.$transaction(
      seatCinemaElements.map((seatCinemaElement) =>
        this.prisma.seatOnCinemaHall.create({
          data: seatCinemaElement,
          include: {
            seat: true,
            type: true,
          },
        }),
      ),
    )

    return data.map((seatFull) => ({
      row: seatFull.seat.row,
      col: seatFull.seat.col,
      type: seatFull.type.type,
    }))
  }

  async findCinemaHallSeatingSchema(cinemaHallId: number): Promise<SeatsSchema> {
    const seats = await this.prisma.seatOnCinemaHall.findMany({
      where: {
        cinemaHallId,
      },
      include: {
        seat: true,
        type: true,
      },
    })

    return seats.map((seatFull) => ({
      row: seatFull.seat.row,
      col: seatFull.seat.col,
      type: seatFull.type.type,
    }))
  }

  async resetCinemaHallSeatingSchema(cinemaHallId: number) {
    return await this.prisma.seatOnCinemaHall.deleteMany({
      where: {
        cinemaHallId,
      },
    })
  }
}
