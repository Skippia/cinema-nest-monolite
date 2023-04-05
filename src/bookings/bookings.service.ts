import { SeatService } from './../seat/seat.service'
import { SeatsInCinemaService } from '../seats-in-cinema/seats-in-cinema.service'
import { PrismaService } from './../prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Booking, Prisma, TypeSeat, TypeSeatEnum } from '@prisma/client'
import { generateActualBookingSchema } from './utils/helpers/generateActualBookingSchema'
import { generateMergedCinemaBookingSeatingSchema } from './utils/helpers/generateMergedCinemaBookingSeatingSchema'
import { generateSourceBookingSchema } from './utils/helpers/generateSourceBookingSchema'
import { ISeatPos } from '../seats-in-cinema/utils/types'
import { IMergedFullCinemaBookingSeatingSchema, ISeatPosWithType, ISeatsSchema } from '../utils/types'
import { calcTotalPrice } from './utils/helpers/calcTotalPrice'

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seatService: SeatService,
    private readonly seatsInCinemaService: SeatsInCinemaService,
  ) {}

  async findCinemaBookingSeatingSchema({
    movieSessionId,
    cinemaId,
  }: {
    movieSessionId: number
    cinemaId: number
  }): Promise<IMergedFullCinemaBookingSeatingSchema> {
    // 1. Get cinema schema
    const cinemaSeatingSchema = await this.seatsInCinemaService.findCinemaSeatingSchema(cinemaId)

    // 2. Generate source bookingSeatingSchema  (IBookingSchema)
    const sourceBookingSchema = generateSourceBookingSchema(cinemaSeatingSchema)

    // 3. Get already booked seats positions
    const bookedSeatsPositionsForMovieSession = await this.findBookedSeatsPositionsForMovieSession(movieSessionId)

    /**
     * 4. Overlap already booked seats to source booking schema
     * (in order to get actual booking schema)
     */
    const actualBookingSchema = generateActualBookingSchema(sourceBookingSchema, bookedSeatsPositionsForMovieSession)

    // 5. Merge to schema and return to frontend only real seats (IMergedCinemaBookingSeatingSchema)
    const mergedFullCinemaBookingSeatingSchema = generateMergedCinemaBookingSeatingSchema(
      cinemaSeatingSchema,
      actualBookingSchema,
    )

    return mergedFullCinemaBookingSeatingSchema
  }

  async findBookingById(bookingId: number): Promise<Booking | null> {
    return await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    })
  }

  async findBookedSeatsPositionsForMovieSession(movieSessionId: number): Promise<ISeatPos[]> {
    const seatsArray = await this.prisma.$queryRaw(Prisma.sql`
      SELECT col, row FROM (SELECT "seatId"
      FROM "SeatOnBooking"
      WHERE "bookingId" IN (
        SELECT "id"
        FROM "Booking"
        WHERE "movieSessionId" = ${movieSessionId}
      )) as M
      JOIN "Seat" as S ON M."seatId" = S."id"
  `)

    return seatsArray as ISeatPos[]
  }

  async findBookingsDataByUser(
    userId: number,
  ): Promise<{ bookingId: number; movieSessionId: number; cinemaId: number }[]> {
    const bookingsDataByUser = await this.prisma.$queryRaw(Prisma.sql`
    SELECT B."id" AS "bookingId", B."movieSessionId", S."cinemaId"
    FROM (
        SELECT "id", "movieSessionId"
        FROM "Booking"
        WHERE "userId"=${userId}
    ) as B
    JOIN "MovieSession" as S ON B."movieSessionId" = S."id";
        `)

    return bookingsDataByUser as { bookingId: number; movieSessionId: number; cinemaId: number }[]
  }

  async findSeatsByBookingId(
    mergedFullCinemaBookingSeatingSchema: IMergedFullCinemaBookingSeatingSchema,
    bookingId: number,
  ): Promise<ISeatPosWithType[]> {
    const bookedSeats = await this.prisma.seatOnBooking.findMany({
      where: {
        bookingId,
      },
      include: {
        seat: true,
      },
    })

    const seatsByBookingId = bookedSeats.map((b) => {
      const { col, row } = b.seat

      // Find this seat in full schema
      const type = mergedFullCinemaBookingSeatingSchema.find(
        (el) => b.seat.col === el.bookingCol && b.seat.row === el.bookingRow,
      )?.type as TypeSeatEnum

      return {
        col,
        row,
        type,
      }
    })

    return seatsByBookingId
  }

  async createBooking(
    { userId, movieSessionId }: { userId: number; movieSessionId: number },
    desiredSeats: ISeatPos[],
  ): Promise<Booking> {
    // TODO: I guess can be optimized via SQL

    // 1. Check if such movie session exists
    const movieSession = await this.prisma.movieSession.findUniqueOrThrow({
      where: {
        id: movieSessionId,
      },
    })

    const mergedFullCinemaBookingSeatingSchema = await this.findCinemaBookingSeatingSchema({
      movieSessionId,
      cinemaId: movieSession.cinemaId,
    })

    // 2. Get seat types for desired seats (first off need to recovery full cinema booking schema)
    const desiredSeatsSchemaWithType = mergedFullCinemaBookingSeatingSchema
      .filter((x) => desiredSeats.some((el) => el.col === x.bookingCol && el.row === x.bookingRow))
      .map((x) => ({
        row: x.bookingRow,
        col: x.bookingCol,
        type: x.type,
      })) as ISeatsSchema

    // 3. Get info about price multiplication factors for our movie session
    const multiFactorsForThisMovieSession = (await this.prisma.movieSessionMultiFactor.findMany({
      where: {
        movieSessionId,
      },
      include: {
        typeSeat: true,
      },
    })) as { priceFactor: number; typeSeat: TypeSeat }[]

    // 4. Calculate total price basded on multiplication factors and base price on movie session
    const totalPrice = calcTotalPrice(desiredSeatsSchemaWithType, multiFactorsForThisMovieSession, movieSession)

    // 5. Convert desired seats to real seats
    const realDesiredSeats = await this.seatService.convertSeatsPositionsToRealSeats(desiredSeats)

    // 6. In transaction create booking then seats for this booking
    const createdBooking = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          movieSessionId,
          totalPrice,
          currency: movieSession.currency,
        },
      })

      await tx.seatOnBooking.createMany({
        data: realDesiredSeats.map((desiredSeat) => ({ seatId: desiredSeat.id, bookingId: booking.id })),
      })

      return booking
    })

    return createdBooking
  }

  async cancelBooking(bookingId: number): Promise<Booking> {
    // 1. Delete all seats for this booking
    // 2. Delete booking itself

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, booking] = await this.prisma.$transaction([
      this.prisma.seatOnBooking.deleteMany({
        where: {
          bookingId,
        },
      }),
      this.prisma.booking.delete({ where: { id: bookingId } }),
    ])

    return booking
  }

  async checkIfSeatsAreAvailableForBooking(
    movieSessionId: number,
    desiredSeats: ISeatPos[],
  ): Promise<{ allSeatsAreAvailable: boolean; bookedSeats: ISeatPos[] }> {
    // 1. Get all booked seats for this movie session
    const bookedSeatsForMovieSession = await this.findBookedSeatsPositionsForMovieSession(movieSessionId)

    // 2. Separate desired seats on two categories: are available for booking
    // and already are booked

    const availableSeats = [] as ISeatPos[]
    const bookedSeats = [] as ISeatPos[]

    desiredSeats.forEach((desiredSeat) => {
      // seat is already booked
      if (
        bookedSeatsForMovieSession.some(
          (bookedSeat) => bookedSeat.col === desiredSeat.col && bookedSeat.row === desiredSeat.row,
        )
      ) {
        bookedSeats.push(desiredSeat)
      } else {
        availableSeats.push(desiredSeat)
      }
    })

    return {
      allSeatsAreAvailable: availableSeats.length === desiredSeats.length,
      bookedSeats: bookedSeats,
    }
  }

  async cancelAllBookingForMovieSessionForUser({
    userId,
    movieSessionId,
  }: {
    userId: number
    movieSessionId: number
  }): Promise<Prisma.BatchPayload> {
    // 1. Delete all seats for all bookings for movie session for user
    // 2. Delete bookings themselfes

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, result] = await this.prisma.$transaction([
      this.prisma.$queryRaw(Prisma.sql`
    DELETE FROM "SeatOnBooking"
    WHERE "bookingId" IN (
      SELECT "id"
      FROM "Booking"
      WHERE "userId" = ${userId} AND "movieSessionId" = ${movieSessionId}
    );
  `),
      this.prisma.booking.deleteMany({
        where: {
          userId,
          movieSessionId,
        },
      }),
    ])

    return result
  }
}
