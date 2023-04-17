import { INestApplication } from '@nestjs/common'
import { MovieSession, TypeSeatEnum } from '@prisma/client'
import { MIN_DAYS_UNTIL_BOOKING } from 'src/modules/bookings/booking.constants'
import { convertSeatsArrayToString } from 'src/modules/bookings/helpers'
import { PrismaService } from 'src/modules/prisma/prisma.service'
import {
  seatsSchemaInput1,
  mergedCinemaSchema1,
  seatsSchemaInput2,
  mergedCinemaSchema2,
  seatsSchemaInput3,
  mergedCinemaSchema3,
} from 'src/modules/seats-in-cinema-hall/tests/seats-in-cinema.mocks'
import request from 'supertest'
import { loadMovies, initApp, signinAccount } from 'test/helpers/common'
import {
  createSeats,
  createTypeSeats,
  createCinemas,
  addMoviesToCinemas,
  createUsers,
  createCinemaHalls,
} from 'test/helpers/create'
import { createMovieSessions } from 'test/helpers/create/createMoviesSessions.'
import {
  bookingMockDataInput1,
  bookingMockDataOutput1,
  mergedCinemaSchemaAfterFirstBooking,
  bookingMockDataInput2,
  bookingMockDataOutput2,
  mergedCinemaSchemaAfterSecondBooking,
  bookingMockDataInput3,
  bookingMockDataOutput3,
} from './bookings.static-mock'

describe('Movies in cinema endoints (e2e)', () => {
  const movieSessionId1 = 1
  const movieSessionId2 = 2
  const movieSessionId3 = 3

  let app: INestApplication
  let prisma: PrismaService
  let cookies: string[]
  let userId1: number

  let cinemaHallId1: number
  let cinemaHallId2: number

  let movieSession1: MovieSession
  let movieSession2: MovieSession
  let movieSession3: MovieSession

  /**
   *   add 1 user
   *   load all movies
   *   add 100 seats,
   *   add 3 type seats
   *   add 2 cinemas,
   *   add 1-2 movies to 3 cinemas
   *   add 3 movie sessions
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    // 1
    userId1 = (await createUsers(prisma)).id

    const cookies = await signinAccount(app)

    await loadMovies(prisma)
    await createSeats(prisma)
    await createTypeSeats(prisma)
    const [cinema1, cinema2] = await createCinemas(prisma)

    // 2
    const [cinemaHall1, cinemaHall2] = await createCinemaHalls(app, cookies, cinema1, cinema2)
    cinemaHallId1 = cinemaHall1.id
    cinemaHallId2 = cinemaHall2.id
    await addMoviesToCinemas(prisma, [
      { cinemaId: cinema1.id, movieId: 1 },
      { cinemaId: cinema1.id, movieId: 2 },
      { cinemaId: cinema2.id, movieId: 1 },
    ])

    // 3
    ;[movieSession1, movieSession2, movieSession3] = await createMovieSessions(prisma)
  }

  beforeAll(async () => {
    ;[app, prisma] = await initApp()

    await runInitMovieDataMigration(prisma)

    cookies = await signinAccount(app)
  })

  afterAll(async () => {
    await prisma.clearDatabase()
    await app.close()
  })

  describe('GET booking schema - /bookings/booking-schema/:sessionId', () => {
    it('get booking schema for movieSession1 (cinemaId = 1) (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/${movieSessionId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema1)
    })

    it('get booking schema for movieSession2 (cinemaId = 2) (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/${movieSessionId2}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema2)
    })

    it('get booking schema for movieSession3 (cinemaId = 3) (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/${movieSessionId3}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema3)
    })
  })

  describe('POST create booking 1 (control case) - /bookings ', () => {
    it('get booking schema (success) - primary schema (0 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/1`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema1)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(0)
    })

    it('create control booking (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput1,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })

    it('get booking schema (success) - after first booking (2 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/1`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchemaAfterFirstBooking)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(2)
    })
  })

  describe('GET bookings, seats by booking', () => {
    it('GET bookings by user - /bookings/users/:userId', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/users/${userId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toEqual(
        expect.arrayContaining([expect.objectContaining(bookingMockDataOutput1(movieSession1))]),
      )
    })

    it('GET seats by booking - /bookings/seats/:bookingId', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/seats/1`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(
        bookingMockDataOutput1(movieSession1).seats.map((e) => ({
          ...e,
          type: TypeSeatEnum.SEAT,
        })),
      )
    })

    it('GET booking by booking id - /bookings/:bookingId', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/1`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })
  })

  describe('POST create booking (different scenario) - /bookings ', () => {
    it('create booking 2 - seats are available (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput2,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput2(movieSession1))
    })

    it('get booking schema (success) - after second booking (4 seats are reserved)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/1`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchemaAfterSecondBooking)
      expect(body.filter((e: any) => !!e.isBooked).length).toEqual(4)
    })

    it('create booking (failure) - such movie session is not exist ', async () => {
      const { status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          movieSessionId: 9999,
        })

      expect(status).toBe(404)
    })

    it('create booking (failure) - such seat is already reserved ', async () => {
      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: bookingMockDataInput1.desiredSeats,
        })

      const alreadyBookedSeatsString = convertSeatsArrayToString(bookingMockDataInput1.desiredSeats)
      const errorMessage = `These seats are already booked: ${alreadyBookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - all seats are not exist in cinema ', async () => {
      const outSeats = [
        { row: 999, col: 999 },
        { row: -1, col: -1 },
      ]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: outSeats,
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - one of seats is not exist in cinema ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const outSeats = [{ row: -1, col: -1 }]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...outSeats],
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - several of seats are not exist in cinema ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const outSeats = [
        { row: 999, col: 999 },
        { row: -1, col: -1 },
      ]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...outSeats],
        })

      const outSeatsString = convertSeatsArrayToString(outSeats)
      const errorMessage = `These seats are outside of booking schema: ${outSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - one of seats is already reserved ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const bookedSeat = [bookingMockDataInput1.desiredSeats[0]]

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...bookedSeat],
        })

      const bookedSeatsString = convertSeatsArrayToString(bookedSeat)
      const errorMessage = `These seats are already booked: ${bookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - several of seats are already reserved ', async () => {
      const availableSeats = bookingMockDataInput3.desiredSeats
      const bookedSeats = bookingMockDataInput1.desiredSeats

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
          desiredSeats: [...availableSeats, ...bookedSeats],
        })

      const bookedSeatsString = convertSeatsArrayToString(bookedSeats)
      const errorMessage = `These seats are already booked: ${bookedSeatsString}`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking (failure) - too far to movie session', async () => {
      // subject movie sessin in one year

      const { body: movieSessionBody } = (await request(app.getHttpServer())
        .post(`/movies-sessions`)
        .set('Cookie', cookies)
        .send({
          startDate: new Date(
            new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
              new Date().getHours(),
              new Date().getMinutes(),
              new Date().getSeconds(),
            ),
          ),
          movieId: 1,
          cinemaHallId: 1,
          price: 40,
          currency: 'USD',
          priceFactors: {
            SEAT: 1,
            VIP: 1.5,
            LOVE: 2.25,
          },
        })) as { body: MovieSession }

      const { body, status } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          userId: 1,
          movieSessionId: movieSessionBody.id,
          desiredSeats: [
            {
              col: 1,
              row: 1,
            },
          ],
        })

      const errorMessage = `Wait please ${10 - MIN_DAYS_UNTIL_BOOKING - 1} day(s) to make a booking`

      expect(status).toBe(400)
      expect(body.message).toBe(errorMessage)
    })

    it('create booking 3 - seats are available (success)', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/bookings`)
        .set('Cookie', cookies)
        .send({
          ...bookingMockDataInput3,
        })

      expect(status).toBe(201)
      expect(body).toMatchObject(bookingMockDataOutput3(movieSession1))
    })
  })

  describe('DELETE cancel booking - /bookings/:bookingId', () => {
    it('cancel booking (success)', async () => {
      const beforeCount = await prisma.booking.count()

      const { body, status } = await request(app.getHttpServer())
        .delete(`/bookings/1`)
        .set('Cookie', cookies)

      const afterCount = await prisma.booking.count()

      expect(status).toBe(200)
      expect(beforeCount - afterCount).toBe(1)
      expect(body).toMatchObject(bookingMockDataOutput1(movieSession1))
    })

    it('cancel all rest booking (success)', async () => {
      const beforeCount = await prisma.booking.count()

      const { body, status } = await request(app.getHttpServer())
        .delete(`/bookings/users/1`)
        .set('Cookie', cookies)

      const afterCount = await prisma.booking.count()

      expect(status).toBe(200)
      expect(beforeCount - afterCount).toBe(2)
      expect(body).toStrictEqual({ count: 2 })
    })
  })
})
