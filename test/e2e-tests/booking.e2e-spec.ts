import { MIN_DAYS_UNTIL_BOOKING } from './../../src/bookings/booking.constants'
import {
  mergedCinemaSchema1,
  mergedCinemaSchema2,
  mergedCinemaSchema3,
  seatsSchemaInput1,
  seatsSchemaInput2,
  seatsSchemaInput3,
} from '../mocks/seats-in-cinema.mocks'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/prisma/prisma.service'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { MovieSession, TypeSeatEnum } from '@prisma/client'
import {
  bookingMockDataInput1,
  bookingMockDataInput2,
  bookingMockDataInput3,
  bookingMockDataOutput1,
  bookingMockDataOutput2,
  bookingMockDataOutput3,
  mergedCinemaSchemaAfterFirstBooking,
  mergedCinemaSchemaAfterSecondBooking,
} from '../mocks/bookings.mock'
import { convertSeatsArrayToString } from '../../src/bookings/utils/helpers/convertSeatsArrayToString'
import { signinAccount } from '../helpers/signinAccount'
import {
  createTypeSeats,
  createCinemas,
  loadMovies,
  createUsers,
  addMoviesToCinemas,
  createMovieSessions,
} from '../helpers'
import { createSeats } from '../helpers/createSeats'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')

describe('Movies in cinema endoints (e2e)', () => {
  const movieSessionId1 = 1
  const movieSessionId2 = 2
  const movieSessionId3 = 3

  let app: INestApplication
  let prisma: PrismaService
  let cookies: string[]
  let userId1: number
  let movieSession1: MovieSession
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let movieSession2: MovieSession
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let movieSession3: MovieSession

  /**
   *   load all movies
   *   add 100 seats,
   *   add 3 type seats
   *   add 3 cinemas,
   *   add 1 user
   *   add 2 movies to 3 cinemas
   *   add 3 movie sessions
   */
  async function runInitMovieDataMigration(prisma: PrismaService) {
    await loadMovies(prisma)
    await createSeats(prisma)
    await createTypeSeats(prisma)
    await createCinemas(prisma)
    await addMoviesToCinemas(prisma, [
      { movieId: 1, cinemaId: 1 },
      { movieId: 2, cinemaId: 1 },
      { movieId: 1, cinemaId: 2 },
      { movieId: 1, cinemaId: 3 },
      { movieId: 2, cinemaId: 3 },
    ])

    userId1 = (await createUsers(prisma)).id
    ;[movieSession1, movieSession2, movieSession3] = await createMovieSessions(prisma)
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
    await runInitMovieDataMigration(prisma)

    cookies = await signinAccount(app)
  })

  afterAll(async () => {
    await prisma.clearDatabase()
    await app.close()
  })

  describe('GET booking schema - /bookings/booking-schema/:sessionId', () => {
    it('get booking schema for movieSession1 (cinemaId = 1) (success)', async () => {
      // Creating seating schema for cinema1

      await request(app.getHttpServer())
        .post('/seats-in-cinema/1')
        .set('Cookie', cookies)
        .send({ ...seatsSchemaInput1 })

      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/${movieSessionId1}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema1)
    })

    it('get booking schema for movieSession2 (cinemaId = 2) (success)', async () => {
      // Creating seating schema for cinema2
      await request(app.getHttpServer())
        .post('/seats-in-cinema/2')
        .set('Cookie', cookies)
        .send({ ...seatsSchemaInput2 })

      const { status, body } = await request(app.getHttpServer())
        .get(`/bookings/booking-schema/${movieSessionId2}`)
        .set('Cookie', cookies)

      expect(status).toBe(200)
      expect(body).toStrictEqual(mergedCinemaSchema2)
    })

    it('get booking schema for movieSession3 (cinemaId = 3) (success)', async () => {
      // Creating seating schema for cinema3
      await request(app.getHttpServer())
        .post('/seats-in-cinema/3')
        .set('Cookie', cookies)
        .send({ ...seatsSchemaInput3 })

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
          cinemaId: 1,
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
