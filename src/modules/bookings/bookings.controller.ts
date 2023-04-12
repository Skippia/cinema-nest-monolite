import { MovieSessionService } from './../movie-session/movie-session.service'
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
  UseFilters,
  ParseIntPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger'
import { Booking } from '@prisma/client'
import { DeleteManyDto } from 'src/common/dtos/common/delete-many.dto'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { SeatsInCinemaService } from '../seats-in-cinema/seats-in-cinema.service'
import { MIN_DAYS_UNTIL_BOOKING } from './booking.constants'
import { BookingsService } from './bookings.service'
import {
  FindMergedCinemaBookingSeatingSchemaDto,
  FindSeatBookingDto,
  CreateBookingDto,
} from './dto'
import { BookingEntity } from './entity'
import {
  getDaysGapRelatevilyNow,
  generateSourceBookingSchema,
  checkIfDesiredSeatsCanExist,
  convertSeatsArrayToString,
} from './helpers'
import { MergedFullCinemaBookingSeatingSchema, SeatPosWithType } from 'src/common/types'

@Controller('bookings')
@ApiTags('Bookings')
@UseFilters(PrismaClientExceptionFilter)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly seatsInCinemaService: SeatsInCinemaService,
    private readonly movieSessionService: MovieSessionService,
  ) {}

  @Get('booking-schema/:movieSessionId')
  @ApiOperation({
    description: 'Get booking schema for movie session (by movieSessionId)',
  })
  @ApiOkResponse({
    type: FindMergedCinemaBookingSeatingSchemaDto,
    isArray: true,
  })
  async findCinemaBookingSeatingSchema(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
  ): Promise<MergedFullCinemaBookingSeatingSchema> {
    const movieSession = await this.movieSessionService.findOneMovieSession(movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Movie session not found with ${movieSessionId}`)
    }

    const cinemaBookingSeatingSchema = await this.bookingsService.findCinemaBookingSeatingSchema({
      movieSessionId: movieSession.id,
      cinemaId: movieSession.cinemaId,
    })

    return cinemaBookingSeatingSchema
  }

  @Get('/users/:userId')
  @ApiOperation({ description: "Get user's bookings" })
  @ApiOkResponse({ type: BookingEntity })
  async findBookingsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BookingEntity[]> {
    // TODO: add checking for existence of user

    const userBookingsData = await this.bookingsService.findBookingsDataByUser(userId)

    const userBookings = await Promise.all(
      userBookingsData.map(async (userBookingData) => {
        const mergedFullCinemaBookingSeatingSchema =
          await this.bookingsService.findCinemaBookingSeatingSchema({
            movieSessionId: userBookingData.movieSessionId,
            cinemaId: userBookingData.cinemaId,
          })

        const seatsByBookingId = await this.bookingsService.findSeatsByBookingId(
          mergedFullCinemaBookingSeatingSchema,
          userBookingData.bookingId,
        )

        const booking = (await this.bookingsService.findBookingById(
          userBookingData.bookingId,
        )) as Booking
        return new BookingEntity(seatsByBookingId, booking)
      }),
    )

    return userBookings
  }

  @Delete('/users/:movieSessionId')
  @ApiOperation({ description: 'Cancel all bookings for this user' })
  @ApiOkResponse({ type: DeleteManyDto })
  async cancelAllBookingForMovieSessionForUser(
    @Param('movieSessionId', ParseIntPipe) movieSessionId: number,
  ): Promise<DeleteManyDto> {
    const movieSession = await this.movieSessionService.findOneMovieSession(movieSessionId)

    // TODO: check if such booking belong this user

    if (!movieSession) {
      throw new NotFoundException(`Could not find movie session with ${movieSessionId}.`)
    }

    // TODO: fix user id
    const deletedBookings = await this.bookingsService.cancelAllBookingForMovieSessionForUser({
      movieSessionId,
      userId: 1,
    })

    return deletedBookings
  }

  @Get('seats/:bookingId')
  @ApiOperation({ description: 'Get seats by bookingId' })
  @ApiOkResponse({ type: FindSeatBookingDto, isArray: true })
  async findSeatsByBookingId(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<SeatPosWithType[]> {
    const booking = await this.bookingsService.findBookingById(bookingId)

    if (!booking) {
      throw new NotFoundException(`Could not find booking with ${bookingId}.`)
    }

    const movieSession = await this.movieSessionService.findOneMovieSession(booking.movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Could not movie session with ${booking.movieSessionId}.`)
    }

    const mergedFullCinemaBookingSeatingSchema =
      await this.bookingsService.findCinemaBookingSeatingSchema({
        movieSessionId: movieSession.id,
        cinemaId: movieSession.cinemaId,
      })

    const seatsByBookingId = await this.bookingsService.findSeatsByBookingId(
      mergedFullCinemaBookingSeatingSchema,
      bookingId,
    )

    return seatsByBookingId
  }

  @Get(':bookingId')
  @ApiOperation({ description: 'Get booking info by bookingId' })
  @ApiOkResponse({ type: BookingEntity })
  async getBookingByBookingId(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<BookingEntity> {
    const booking = await this.bookingsService.findBookingById(bookingId)

    if (!booking) {
      throw new NotFoundException(`Could not find booking with ${bookingId}.`)
    }

    const movieSession = await this.movieSessionService.findOneMovieSession(booking.movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Could not movie session with ${booking.movieSessionId}.`)
    }

    const mergedFullCinemaBookingSeatingSchema =
      await this.bookingsService.findCinemaBookingSeatingSchema({
        movieSessionId: movieSession.id,
        cinemaId: movieSession.cinemaId,
      })

    const seatsByBookingId = await this.bookingsService.findSeatsByBookingId(
      mergedFullCinemaBookingSeatingSchema,
      bookingId,
    )

    const clientBooking = new BookingEntity(seatsByBookingId, booking)

    return clientBooking
  }

  @Post()
  @ApiOperation({ description: 'Create booking' })
  @ApiOkResponse({ type: BookingEntity })
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingEntity> {
    const { desiredSeats, movieSessionId, userId } = dto

    // 1. Here should be role checking
    // TODO: userId is temporal decision (it will be taken from current user session)
    if (!userId) {
      throw new NotFoundException(`User with id: ${userId} is not exist`)
    }

    const movieSession = await this.movieSessionService.findOneMovieSession(movieSessionId)

    // 2. Check if such movie session exists
    if (!movieSession) {
      throw new NotFoundException(`Movie session with id: ${movieSessionId} is not exist`)
    }

    const daysGapRelatevilyNow = getDaysGapRelatevilyNow(movieSession.startDate)

    // 3. Check date for booking (if it's allowed)
    const isBookingAllowed = daysGapRelatevilyNow < MIN_DAYS_UNTIL_BOOKING

    if (!isBookingAllowed) {
      throw new BadRequestException(
        `Wait please ${daysGapRelatevilyNow - MIN_DAYS_UNTIL_BOOKING} day(s) to make a booking`,
      )
    }

    const cinemaSeatingSchema = await this.seatsInCinemaService.findCinemaSeatingSchema(
      movieSession.cinemaId,
    )
    const sourceBookingSchema = generateSourceBookingSchema(cinemaSeatingSchema)

    // 3. Check if desired seats ∈ bookingSeats
    const { isDesiredSeatsCanExist, wrongSeats } = checkIfDesiredSeatsCanExist({
      set: sourceBookingSchema,
      subset: desiredSeats,
    })

    if (!isDesiredSeatsCanExist) {
      const wrongSeatsString = convertSeatsArrayToString(wrongSeats)
      throw new BadRequestException(
        `These seats are outside of booking schema: ${wrongSeatsString}`,
      )
    }

    // 4. Check if these seat(s) are not reserved yet
    const { allSeatsAreAvailable, bookedSeats } =
      await this.bookingsService.checkIfSeatsAreAvailableForBooking(movieSessionId, desiredSeats)

    // 5. If some seats are reserved throw error cause such booking can't be created
    if (!allSeatsAreAvailable) {
      const bookedSeatsString = convertSeatsArrayToString(bookedSeats)
      throw new BadRequestException(`These seats are already booked: ${bookedSeatsString}`)
    }

    // 6. If all seats from desired are available for booking then create such booking
    const newBooking = await this.bookingsService.createBooking(
      { movieSessionId, userId },
      desiredSeats,
    )

    const mergedFullCinemaBookingSeatingSchema =
      await this.bookingsService.findCinemaBookingSeatingSchema({
        movieSessionId,
        cinemaId: movieSession.cinemaId,
      })

    const seatsByBookingId = await this.bookingsService.findSeatsByBookingId(
      mergedFullCinemaBookingSeatingSchema,
      newBooking.id,
    )

    const newClientBookingClientBooking = new BookingEntity(seatsByBookingId, newBooking)

    return newClientBookingClientBooking
  }

  @Delete(':bookingId')
  @ApiOperation({ description: 'Cancel booking by bookingId' })
  @ApiOkResponse({ type: BookingEntity })
  async cancelBooking(@Param('bookingId', ParseIntPipe) bookingId: number): Promise<BookingEntity> {
    const booking = await this.bookingsService.findBookingById(bookingId)

    // TODO: check if such booking belong this user

    if (!booking) {
      throw new NotFoundException(`Could not find booking with ${bookingId}.`)
    }

    const movieSession = await this.movieSessionService.findOneMovieSession(booking.movieSessionId)

    if (!movieSession) {
      throw new NotFoundException(`Could not movie session with ${booking.movieSessionId}.`)
    }

    const mergedFullCinemaBookingSeatingSchema =
      await this.bookingsService.findCinemaBookingSeatingSchema({
        movieSessionId: movieSession.id,
        cinemaId: movieSession.cinemaId,
      })

    const seatsByBookingId = await this.bookingsService.findSeatsByBookingId(
      mergedFullCinemaBookingSeatingSchema,
      bookingId,
    )

    const clientCanceledBooking = new BookingEntity(seatsByBookingId, booking)

    await this.bookingsService.cancelBooking(bookingId)

    return clientCanceledBooking
  }
}
