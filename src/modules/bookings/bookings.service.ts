import { SeatsInCinemaHallService } from './../seats-in-cinema-hall/seats-in-cinema-hall.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Booking, Prisma, TypeSeatEnum, TypeSeat } from '@prisma/client'
import {
  MergedFullCinemaBookingSeatingSchema,
  SeatPosWithType,
  SeatsSchema,
} from '../../common/types'
import { MovieSessionService } from '../movie-session/movie-session.service'
import { PrismaService } from '../prisma/prisma.service'
import { SeatService } from '../seat/seat.service'
import { SeatPosWithTypeDto } from './dto'
import {
  calcTotalPrice,
  generateActualBookingSchema,
  generateMergedCinemaBookingSeatingSchema,
  generateSourceBookingSchema,
} from './helpers'

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seatService: SeatService,
    private readonly seatsInCinemaHallService: SeatsInCinemaHallService,
    private readonly movieSessionService: MovieSessionService,
  ) {}

  async findOneBooking(uniqueCriteria: Prisma.BookingWhereUniqueInput): Promise<Booking | null> {
    return await this.prisma.booking.findUnique({
      where: uniqueCriteria,
    })
  }

  async findBookingsDataByUser(
    userId: number,
  ): Promise<{ bookingId: number; movieSessionId: number; cinemaHallId: number }[]> {
    const bookingsDataByUser = await this.prisma.$queryRaw(Prisma.sql`
    SELECT B."id" AS "bookingId", B."movieSessionId", S."cinemaHallId"
    FROM (
        SELECT "id", "movieSessionId"
        FROM "Booking"
        WHERE "userId"=${userId}
    ) as B
    JOIN "MovieSession" as S ON B."movieSessionId" = S."id";
        `)

    return bookingsDataByUser as {
      bookingId: number
      movieSessionId: number
      cinemaHallId: number
    }[]
  }

  async findSeatsByBookingId(
    mergedFullCinemaBookingSeatingSchema: MergedFullCinemaBookingSeatingSchema,
    bookingId: number,
  ): Promise<SeatPosWithType[]> {
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
    desiredSeats: SeatPosWithTypeDto[],
  ): Promise<Booking> {
    // 1. Check if such movie session exists
    const movieSession = await this.prisma.movieSession.findUniqueOrThrow({
      where: {
        id: movieSessionId,
      },
    })

    const mergedFullCinemaBookingSeatingSchema =
      await this.findCinemaBookingSeatingSchemaByMovieSessionId(movieSessionId)

    // 2. Get seat types for desired seats (first off need to recovery full cinema booking schema)
    const desiredSeatsSchemaWithType = mergedFullCinemaBookingSeatingSchema
      .filter((x) => desiredSeats.some((el) => el.col === x.bookingCol && el.row === x.bookingRow))
      .map((x) => ({
        row: x.bookingRow,
        col: x.bookingCol,
        type: x.type,
      })) as SeatsSchema

    // 3. Get info about price multiplication factors for our movie session
    const multiFactorsForThisMovieSession: { priceFactor: number; typeSeat: TypeSeat }[] =
      await this.prisma.movieSessionMultiFactor.findMany({
        where: {
          movieSessionId,
        },
        include: {
          typeSeat: true,
        },
      })

    // 4. Calculate total price basded on multiplication factors and base price on movie session
    const totalPrice = calcTotalPrice(
      desiredSeatsSchemaWithType,
      multiFactorsForThisMovieSession,
      movieSession,
    )

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
        data: realDesiredSeats.map((desiredSeat) => ({
          seatId: desiredSeat.id,
          bookingId: booking.id,
        })),
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
    desiredSeats: SeatPosWithTypeDto[],
  ): Promise<{ allSeatsAreAvailable: boolean; bookedSeats: SeatPosWithTypeDto[] }> {
    // 1. Get all booked seats for this movie session
    const bookedSeatsForMovieSession = await this.findBookedSeatsPositionsForMovieSession(
      movieSessionId,
    )

    // 2. Separate desired seats on two categories: are available for booking
    // and already are booked

    const availableSeats = [] as SeatPosWithTypeDto[]
    const bookedSeats = [] as SeatPosWithTypeDto[]

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

  async findCinemaBookingSeatingSchemaByMovieSessionId(
    movieSessionId: number,
  ): Promise<MergedFullCinemaBookingSeatingSchema> {
    // 0. Get cinema hall by movieSessionId
    const movieSession = await this.movieSessionService.findOneMovieSession(
      { id: movieSessionId },
      true,
    )

    if (!movieSession) {
      throw new BadRequestException(`Movie session with id = ${movieSessionId} is not existed`)
    }

    // 1. Get cinema schema
    const cinemaSeatingSchema = await this.seatsInCinemaHallService.findCinemaHallSeatingSchema(
      movieSession.cinemaHallId,
    )

    // 2. Generate source bookingSeatingSchema  (BookingSchema)
    const sourceBookingSchema = generateSourceBookingSchema(cinemaSeatingSchema)

    // 3. Get already booked seats positions
    const bookedSeatsPositionsForMovieSession = await this.findBookedSeatsPositionsForMovieSession(
      movieSessionId,
    )

    /**
     * 4. Overlap already booked seats to source booking schema
     * (in order to get actual booking schema)
     */
    const actualBookingSchema = generateActualBookingSchema(
      sourceBookingSchema,
      bookedSeatsPositionsForMovieSession,
    )

    // 5. Merge to schema and return to frontend only real seats (MergedCinemaBookingSeatingSchema)
    const mergedFullCinemaBookingSeatingSchema = generateMergedCinemaBookingSeatingSchema(
      cinemaSeatingSchema,
      actualBookingSchema,
    )

    return mergedFullCinemaBookingSeatingSchema
  }

  async findBookedSeatsPositionsForMovieSession(
    movieSessionId: number,
  ): Promise<SeatPosWithTypeDto[]> {
    const seatsArray = await this.prisma.$queryRaw(Prisma.sql`
      SELECT col, row FROM 
        (
          SELECT "seatId"
          FROM "SeatOnBooking"
          WHERE "bookingId" IN 
            (
              SELECT "id"
              FROM "Booking"
              WHERE "movieSessionId" = ${movieSessionId}
            )
        ) as M
      JOIN "Seat" as S ON M."seatId" = S."id"
  `)

    return seatsArray as SeatPosWithTypeDto[]
  }

  async findUserBookingsWithSeats(
    userBookingsData: {
      bookingId: number
      movieSessionId: number
      cinemaHallId: number
    }[],
  ) {
    const userBookings = await Promise.all(
      userBookingsData.map(async (userBookingData) => {
        const mergedFullCinemaBookingSeatingSchema =
          await this.findCinemaBookingSeatingSchemaByMovieSessionId(userBookingData.movieSessionId)

        const seatsByBookingId = await this.findSeatsByBookingId(
          mergedFullCinemaBookingSeatingSchema,
          userBookingData.bookingId,
        )

        const booking = (await this.findOneBooking({
          id: userBookingData.bookingId,
        })) as Booking

        return { seatsByBookingId, booking }
      }),
    )

    return userBookings
  }
}
