import { Injectable } from '@nestjs/common'
import { TypeSeatEnum, TypeSeat, Seat, SeatOnCinema } from '@prisma/client'
import { SeatsSchema, SeatPosWithType } from 'src/common/types'
import { PrismaService } from '../prisma/prisma.service'
import { SeatService } from '../seat/seat.service'
import { CreateCinemaSeatingSchemaDto } from './dto'
import { generateBaseSeatSchema } from './utils/helpers'
import {
  ChainSeatsOverrider,
  overrideWithLoveSeats,
  overrideWithVipSeats,
} from './utils/helpers/OverrideSeats'

@Injectable()
export class SeatsInCinemaService {
  constructor(private readonly prisma: PrismaService, private readonly seatService: SeatService) {}

  async createCinemaSeatingSchema(
    cinemaId: number,
    seatsSchemaData: CreateCinemaSeatingSchemaDto,
  ): Promise<SeatsSchema> {
    /**
     * Generate seats schema (only seats, without empties)
     */
    const { vipSeats = [], loveSeats = [] } = seatsSchemaData
    const basedSeatsSchema = generateBaseSeatSchema(seatsSchemaData)

    const chainSeatsOverrider = new ChainSeatsOverrider({
      source: basedSeatsSchema,
      mappers: [overrideWithVipSeats(vipSeats), overrideWithLoveSeats(loveSeats)],
    })

    const processedSchema = chainSeatsOverrider.run()

    /**
     * Replace seats for real seats or create
     */
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

    /**
     * Add generated seats from realSeatsSchema to cinema (db)
     */
    const addedSeatsToCinemaArray = await this.addSeatsToCinemaByType(cinemaId, [
      {
        schema: realSeatsSchema,
        typeSeat: { id: defaultSeatTypeId, type: TypeSeatEnum.SEAT },
      },
      {
        schema: realSeatsSchema,
        typeSeat: { id: vipSeatTypeId, type: TypeSeatEnum.VIP },
      },
      {
        schema: realSeatsSchema,
        typeSeat: { id: loveSeatTypeId, type: TypeSeatEnum.LOVE },
      },
    ])

    return addedSeatsToCinemaArray
  }

  async addSeatsToCinemaByType(
    cinemaId: number,
    data: {
      schema: (SeatPosWithType & { id: number })[]
      typeSeat: TypeSeat
    }[],
  ): Promise<SeatPosWithType[]> {
    const addedSeatsToCinemaDoubleArray = await Promise.all(
      data.map((el) =>
        this.addSeatsSchemaToCinema(
          cinemaId,
          el.schema.filter((e) => e.type === el.typeSeat.type),
          el.typeSeat.id,
        ),
      ),
    )
    const addedSeatsToCinemaArray = addedSeatsToCinemaDoubleArray.flatMap((el) => el)

    return addedSeatsToCinemaArray
  }

  async addSeatsSchemaToCinema(
    cinemaId: number,
    seats: Seat[],
    typeSeatId: number,
  ): Promise<SeatPosWithType[]> {
    const seatCinemaElements = seats.reduce(
      (acc, seat) => [...acc, { cinemaId, seatId: seat.id, typeSeatId }],
      [] as SeatOnCinema[],
    )

    /**
     * In createMany is impossible to return created records
     * */
    const data = await this.prisma.$transaction(
      seatCinemaElements.map((seatCinemaElement) =>
        this.prisma.seatOnCinema.create({
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

  async findCinemaSeatingSchema(cinemaId: number): Promise<SeatsSchema> {
    const seats = await this.prisma.seatOnCinema.findMany({
      where: {
        cinemaId,
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

  async resetCinemaSeatingSchema(cinemaId: number) {
    return await this.prisma.seatOnCinema.deleteMany({
      where: {
        cinemaId,
      },
    })
  }
}
